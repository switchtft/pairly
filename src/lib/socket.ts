import { Server as SocketIOServer, type Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import type { Server as HTTPServer } from 'http';

// Socket event type definitions
export interface ServerToClientEvents {
  'queue:update': (data: {
    queueLength: number;
    estimatedWaitTime: number;
    availableTeammates: number;
  }) => void;
  'match:found': (data: {
    sessionId: string;
    teammate: {
      id: string;
      username: string;
      rank: string;
    };
  }) => void;
  'teammate:online': (data: {
    username: string;
    game: string;
  }) => void;
  'teammate:offline': (data: {
    username: string;
  }) => void;
  'chat:message': (data: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  }) => void;
}

export interface ClientToServerEvents {
  'queue:join': (data: { game: string; gameMode: string }) => void;
  'queue:leave': () => void;
  'chat:send': (data: { sessionId: string; content: string }) => void;
  'session:join': (data: { sessionId: string }) => void;
  'teammate:status': (data: { isOnline: boolean }) => void;
}

export interface InterServerEvents {
  // Add any inter-server events if needed
}

export interface SocketData {
  userId: string;
  username: string;
  isPro: boolean;
  game: string | null;
}

// Global reference to the socket server
let globalSocketServer: SocketIOServer | null = null;

function initSocketServer(server: HTTPServer & { io?: SocketIOServer }) {
  if (!server.io) {
    const io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    // Authentication middleware
    io.use(async (socket: Socket & { data?: { userId: number; username: string; isPro: boolean; game: string | null } }, next: (err?: Error) => void) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        
        // Get user data
        const prisma = new PrismaClient();
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            username: true,
            isPro: true,
            game: true,
          },
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.data = {
          userId: user.id,
          username: user.username,
          isPro: user.isPro,
          game: user.game,
        };
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    // Connection handler
    io.on('connection', (socket: Socket & { data?: { userId: string; username: string; isPro: boolean; game: string | null } }) => {
      console.log(`User ${socket.data.username} connected`);

      // Update user's online status
      updateUserOnlineStatus(socket.data.userId, true);

      // Join user to their personal room
      socket.join(`user:${socket.data.userId}`);

      // If user is a pro teammate, join them to the teammates room
      if (socket.data.isPro) {
        socket.join('teammates');
        socket.join(`teammates:${socket.data.game || 'all'}`);
      }

      // Handle queue join
      socket.on('queue:join', async (data: { game: string; gameMode: string }) => {
        try {
          socket.join(`queue:${data.game}`);
          socket.join(`queue:${data.game}:${data.gameMode}`);
          
          // Update user's game preference
          socket.data.game = data.game;
          
          // Broadcast queue update
          await broadcastQueueUpdate(data.game);
        } catch (error) {
          console.error('Error joining queue:', error);
        }
      });

      // Handle queue leave
      socket.on('queue:leave', async () => {
        try {
          // Leave all queue rooms
          const rooms = Array.from(socket.rooms);
          rooms.forEach((room: unknown) => {
            if (typeof room === 'string' && room.startsWith('queue:')) {
              socket.leave(room);
            }
          });
          
          // Broadcast queue update
          if (socket.data.game) {
            await broadcastQueueUpdate(socket.data.game);
          }
        } catch (error) {
          console.error('Error leaving queue:', error);
        }
      });

      // Handle match acceptance
      socket.on('match:accept', async (data: { sessionId: string; clientId: string; teammateId: string }) => {
        try {
          const { sessionId, clientId, teammateId } = data;
          
          // Notify the client that their match was accepted
          io.to(`user:${clientId}`).emit('match:accepted', {
            sessionId,
            teammateId: socket.data.userId,
            teammateUsername: socket.data.username,
          });
          
          // Update session status
          const prisma = new PrismaClient();
          await prisma.session.update({
            where: { id: sessionId },
            data: { status: 'Active' },
          });
          
          // Join both users to the session room
          socket.join(`session:${sessionId}`);
          io.sockets.sockets.forEach((clientSocket: Socket & { data?: { userId: number; username: string; isPro: boolean; game: string | null } }) => {
            if (clientSocket.data.userId === clientId) {
              clientSocket.join(`session:${sessionId}`);
            }
          });
          
        } catch (error) {
          console.error('Error accepting match:', error);
        }
      });

      // Handle match rejection
      socket.on('match:reject', async (data: { sessionId: number; clientId: number }) => {
        try {
          const { sessionId, clientId } = data;
          
          // Notify the client that their match was rejected
          io.to(`user:${clientId}`).emit('match:rejected', {
            sessionId,
            reason: 'Teammate rejected the match',
          });
          
          // Update session status
          const prisma = new PrismaClient();
          await prisma.session.update({
            where: { id: sessionId },
            data: { status: 'Cancelled' },
          });
          
        } catch (error) {
          console.error('Error rejecting match:', error);
        }
      });

      // Handle session messages
      socket.on('session:message', async (data: { sessionId: string; message: string; type?: string }) => {
        try {
          const { sessionId, message, type = 'text' } = data;
          
          // Broadcast message to session room
          io.to(`session:${sessionId}`).emit('session:message', {
            userId: socket.data.userId,
            username: socket.data.username,
            message,
            type,
            timestamp: new Date().toISOString(),
          });
          
          // Store message in database
          const prisma = new PrismaClient();
          await prisma.chatMessage.create({
            data: {
              sessionId,
              senderId: socket.data.userId,
              content: message,
              type,
            },
          });
          
        } catch (error) {
          console.error('Error sending message:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        try {
          // Update user's online status
          await updateUserOnlineStatus(socket.data.userId, false);
          
          // Leave all rooms
          socket.rooms.forEach((room: unknown) => {
            if (typeof room === 'string') {
              socket.leave(room);
            }
          });
          
          console.log(`User ${socket.data.username} disconnected`);
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });
    });

    server.io = io;
    globalSocketServer = io;
  }
  
  return server.io;
}

async function updateUserOnlineStatus(userId: string, isOnline: boolean) {
  try {
    const prisma = new PrismaClient();
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isOnline,
        lastSeen: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating user online status:', error);
  }
}

async function broadcastQueueUpdate(game: string) {
  try {
    const prisma = new PrismaClient();
    
    // Get queue count for the game
    const queueCount = await prisma.queueEntry.count({
      where: { 
        game,
        status: 'waiting',
      },
    });
    
    // Broadcast to all users in the game queue
    if (globalSocketServer) {
      globalSocketServer.to(`queue:${game}`).emit('queue:update', {
        game,
        count: queueCount,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error broadcasting queue update:', error);
  }
}

async function notifyMatchFound(sessionId: string, clientId: string, teammateId: string) {
  try {
    if (globalSocketServer) {
      // Notify the client
      globalSocketServer.to(`user:${clientId}`).emit('match:found', {
        sessionId,
        teammateId,
        timestamp: new Date().toISOString(),
      });
      
      // Notify the teammate
      globalSocketServer.to(`user:${teammateId}`).emit('match:found', {
        sessionId,
        clientId,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error notifying match found:', error);
  }
}

export { initSocketServer, notifyMatchFound }; 