// app/api/auth/csrf-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import csrfTokenHandler from '@/lib/csrfToken';

export async function GET(request: NextRequest) {
  try {
    const token = await csrfTokenHandler.generate();
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
