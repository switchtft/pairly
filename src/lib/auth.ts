import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface TokenPayload {
  userId: number;
  email: string;
  username: string;
}

// Use synchronous decoding for immediate feedback
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;  // Return null instead of logging to avoid unnecessary logging
  }
}

// Use shorter expiration for increased security and performance (if needed)
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

/**
 * Represents the result of an authentication check.
 */
export interface AuthResult {
  user: { userId: number } | null;
  error?: string;
  status?: number;
}

/**
 * Verifies the JWT token from the request's cookies.
 * This function should be used in API routes to protect endpoints.
 * @param request - The NextRequest object.
 * @returns An object containing the user payload if successful, or an error message and status code if not.
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  // FIX: Added 'await' before cookies()
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { user: null, error: 'Not authenticated', status: 401 };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return { user: null, error: 'Invalid or expired token', status: 401 };
  }

  return { user: { userId: payload.userId } };
}
