import { NextRequest } from 'next/server';
import { initSocketServer } from '@/lib/socket';

export async function GET(req: NextRequest) {
  // This route is used to initialize the WebSocket server
  // The actual WebSocket connection is handled by Socket.IO
  return new Response('WebSocket server is running', { status: 200 });
}

export async function POST(req: NextRequest) {
  // Handle any POST requests to the socket endpoint
  return new Response('Method not allowed', { status: 405 });
} 