import crypto from 'crypto';
import { NextResponse, NextRequest } from 'next/server';
import prisma from './prisma'; // Import Prisma client

const CSRF_TOKEN_EXPIRATION_MINUTES = 15;

/**
 * Handles the creation and validation of single-use CSRF tokens.
 * This implementation uses the stateful token pattern, where tokens are stored
 * on the server and invalidated after first use.
 */
class CSRFTokenHandler {
  /**
   * Generates a new, secure CSRF token and stores its record in the database.
   * NOTE: This version does NOT require a userId, as per your new schema.
   * @returns The generated CSRF token string.
   */
  public async generate(): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + CSRF_TOKEN_EXPIRATION_MINUTES * 60 * 1000);

    // This creates a new record in your `CSRFToken` table,
    // filling the `token` and `expiresAt` fields.
    // The `id` and `createdAt` fields are handled automatically by the database.
    await prisma.cSRFToken.create({
      data: {
        token,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Verifies a CSRF token from a request.
   * A valid token must exist and not be expired.
   * The token is DELETED after verification to ensure it is single-use and prevent replay attacks.
   * NOTE: This version does NOT verify against a userId, as per your new schema.
   * @param token - The CSRF token string from the request header or body.
   * @returns `true` if the token is valid, `false` otherwise.
   */
  public async verify(token: string): Promise<boolean> {
    try {
      // 1. Find the token in the `CSRFToken` table.
      const storedToken = await prisma.cSRFToken.findFirst({
        where: { token },
      });

      // If token doesn't exist, it's invalid.
      if (!storedToken) {
        return false;
      }

      // 2. IMPORTANT: Delete the token using its unique `id` to prevent it from being used again.
      await prisma.cSRFToken.delete({
        where: { id: storedToken.id },
      });

      // 3. Check if the now-deleted token was expired by comparing its `expiresAt` field.
      const isExpired = new Date() > storedToken.expiresAt;
      if (isExpired) {
        return false;
      }

      // If all checks pass, the token was valid for this one-time use.
      return true;
    } catch (error) {
      console.error('Error during CSRF token verification:', error);
      // In case of a database or other error, always fail securely.
      return false;
    }
  }

  /**
   * An example middleware function to protect an API route.
   * It expects the token in the 'X-CSRF-Token' header or body.
   */
  public async middleware(request: NextRequest) {
    // This middleware should only run for state-changing methods (POST, PUT, DELETE, etc.)
    if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
        return NextResponse.next();
    }

    const tokenFromClient = request.headers.get('X-CSRF-Token');

    if (!tokenFromClient) {
      return NextResponse.json({ error: 'CSRF token missing from headers' }, { status: 403 });
    }

    const isValid = await this.verify(tokenFromClient);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired CSRF token' }, { status: 403 });
    }

    // If the token is valid, allow the request to proceed.
    return NextResponse.next();
  }
}

const csrfTokenHandler = new CSRFTokenHandler();
export default csrfTokenHandler;
