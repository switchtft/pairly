const { Server: SocketIOServer } = require('socket.io');
const jwt = require('jsonwebtoken');

function initSocketServer(server) {
  if (!server.io) {
    const io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    // Authentication middleware
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user data
        const { PrismaClient } = require('@prisma/client');
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
    io.on('connection', (socket) => {
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
      socket.on('queue:join', async (data) => {
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
          rooms.forEach(room => {
            if (room.startsWith('queue:')) {
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

      // Handle chat messages
      socket.on('chat:send', async (data) => {
        try {
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();

          // Save message to database
          const message = await prisma.chatMessage.create({
            data: {
              sessionId: data.sessionId,
              senderId: socket.data.userId,
              content: data.content,
            },
            include: {
              sender: {
                select: {
                  username: true,
                },
              },
            },
          });

          // Broadcast to session room
          io.to(`session:${data.sessionId}`).emit('chat:message', {
            sessionId: data.sessionId,
            message: {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              senderName: message.sender.username,
              createdAt: message.createdAt.toISOString(),
            },
          });
        } catch (error) {
          console.error('Error sending chat message:', error);
        }
      });

      // Handle session join
      socket.on('session:join', (data) => {
        socket.join(`session:${data.sessionId}`);
      });

      // Handle teammate status updates
      socket.on('teammate:status', async (data) => {
        try {
          await updateUserOnlineStatus(socket.data.userId, data.isOnline);
          
          if (data.isOnline) {
            io.to('teammates').emit('teammate:online', {
              teammateId: socket.data.userId,
              username: socket.data.username,
              game: socket.data.game,
            });
          } else {
            io.to('teammates').emit('teammate:offline', {
              teammateId: socket.data.userId,
              username: socket.data.username,
            });
          }
        } catch (error) {
          console.error('Error updating teammate status:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`User ${socket.data.username} disconnected`);
        await updateUserOnlineStatus(socket.data.userId, false);
        
        if (socket.data.isPro) {
          io.to('teammates').emit('teammate:offline', {
            teammateId: socket.data.userId,
            username: socket.data.username,
          });
        }
      });
    });

    server.io = io;
  }

  return server.io;
}

async function updateUserOnlineStatus(userId, isOnline) {
  try {
    const { PrismaClient } = require('@prisma/client');
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

async function broadcastQueueUpdate(game) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Get queue length for the game
    const queueLength = await prisma.queueEntry.count({
      where: {
        game,
        status: 'waiting',
      },
    });

    // Get available teammates for the game
    const availableTeammates = await prisma.user.count({
      where: {
        game,
        isPro: true,
        isOnline: true,
      },
    });

    // Calculate estimated wait time (simple calculation)
    const estimatedWaitTime = Math.max(1, Math.ceil(queueLength / Math.max(1, availableTeammates)) * 5);

    // Broadcast to all users in the queue for this game
    global.io.to(`queue:${game}`).emit('queue:update', {
      queueLength,
      estimatedWaitTime,
      availableTeammates,
    });
  } catch (error) {
    console.error('Error broadcasting queue update:', error);
  }
}

async function notifyMatchFound(sessionId, clientId, teammateId) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Get teammate info
    const teammate = await prisma.user.findUnique({
      where: { id: teammateId },
      select: {
        id: true,
        username: true,
        rank: true,
      },
    });

    if (!teammate) {
      console.error('Teammate not found for match notification');
      return;
    }

    // Notify client
    global.io.to(`user:${clientId}`).emit('match:found', {
      sessionId,
      teammate: {
        id: teammate.id,
        username: teammate.username,
        rank: teammate.rank,
      },
    });

    // Notify teammate
    global.io.to(`user:${teammateId}`).emit('match:found', {
      sessionId,
      teammate: {
        id: teammate.id,
        username: teammate.username,
        rank: teammate.rank,
      },
    });
  } catch (error) {
    console.error('Error notifying match found:', error);
  }
}

module.exports = {
  initSocketServer,
  notifyMatchFound,
}; 