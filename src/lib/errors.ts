// @/lib/errors.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import csrfTokenHandler from './csrfToken'; // <-- Importujemy handler CSRF

export class ApiError extends Error {
  statusCode: number;
  details?: Record<string, unknown> | unknown;

  constructor(statusCode: number, message: string, details?: Record<string, unknown> | unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Centralny handler błędów dla API.
 * Teraz do odpowiedzi o błędzie dołącza nowy token CSRF.
 * @param error - Przechwycony błąd
 * @returns NextResponse z ustandaryzowanym formatem błędu i nowym tokenem
 */
export async function errorHandler(error: unknown): Promise<NextResponse> {
  console.error("API Error Handled:", error);

  // Generujemy nowy token, który zostanie odesłany z odpowiedzią o błędzie
  const newCsrfToken = await csrfTokenHandler.generate();

  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: error.message, details: error.details, newCsrfToken },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, message: 'Validation failed', details: error.flatten(), newCsrfToken },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: false, message: 'An internal server error occurred.', newCsrfToken },
    { status: 500 }
  );
}
