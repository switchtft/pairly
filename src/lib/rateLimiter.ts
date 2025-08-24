import prisma from './prisma'; // Import Prisma client
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

interface RateLimitResult {
  isAllowed: boolean;
  remaining: number;
  resetTime: Date;
}

class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Checks the rate limit for a given identifier and returns the result.
   * This version is optimized to reduce database calls.
   */
  public async check(identifier: string): Promise<RateLimitResult> {
    const currentTime = new Date();
    const expiresAt = new Date(currentTime.getTime() + this.config.windowMs);

    try {
      // Use a single transaction to find and update the record atomically
      const result = await prisma.$transaction(async (tx) => {
        let record = await tx.rateLimit.findUnique({
          where: { identifier },
        });

        // If the record exists and is expired, reset it
        if (record && currentTime > record.expiresAt) {
          record = null; // Treat it as non-existent to create a new one
        }

        // If no record, create one
        if (!record) {
          await tx.rateLimit.upsert({
            where: { identifier },
            update: { count: 1, expiresAt },
            create: { identifier, count: 1, expiresAt },
          });
          return {
            isAllowed: true,
            remaining: this.config.maxRequests - 1,
            resetTime: expiresAt,
          };
        }

        // If limit is exceeded, deny the request
        if (record.count >= this.config.maxRequests) {
          return {
            isAllowed: false,
            remaining: 0,
            resetTime: record.expiresAt,
          };
        }

        // Otherwise, increment and allow
        const updatedRecord = await tx.rateLimit.update({
          where: { identifier },
          data: { count: { increment: 1 } },
        });

        return {
          isAllowed: true,
          remaining: this.config.maxRequests - updatedRecord.count,
          resetTime: record.expiresAt,
        };
      });

      return result;
    } catch (error) {
      console.error('Rate limiter database error:', error);
      // In case of a database error, we allow the request to prevent service disruption.
      return {
        isAllowed: true,
        remaining: this.config.maxRequests,
        resetTime: expiresAt,
      };
    }
  }

  /**
   * A middleware function to apply rate limiting to a Next.js API route or middleware chain.
   */
  public async middleware(request: NextRequest): Promise<NextResponse> {
    const ip = (request.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();

    const { isAllowed, remaining, resetTime } = await this.check(ip);

    // Prepare headers for the response
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(this.config.maxRequests));
    headers.set('X-RateLimit-Remaining', String(remaining));
    headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime.getTime() / 1000)));

    if (!isAllowed) {
      const retryAfter = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
      headers.set('Retry-After', String(retryAfter));

      return new NextResponse(JSON.stringify({ error: this.config.message }), {
        status: 429, // Too Many Requests
        headers,
      });
    }

    // If allowed, pass the request to the next handler, adding the rate limit headers
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  }
}

const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // A more reasonable limit for general API usage
  message: 'Too many requests from this IP, please try again later.',
});

export default rateLimiter;
