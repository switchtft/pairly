import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from './auth';
export function initSocketServer(server) {
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
                    return next(new Error('Authentication error'));
                }
                const decoded = verifyToken(token);
                if (!decoded) {
                    return next(new Error('Invalid token'));
                }
                // Get user data
                const { PrismaClient } = await import('@prisma/client');
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
                socket.data = user;
                next();
            }
            catch (error) {
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
                }
                catch (error) {
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
                }
                catch (error) {
                    console.error('Error leaving queue:', error);
                }
            });
            // Handle chat messages
            socket.on('chat:send', async (data) => {
                try {
                    const { PrismaClient } = await import('@prisma/client');
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
                }
                catch (error) {
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
                    const { PrismaClient } = await import('@prisma/client');
                    const prisma = new PrismaClient();
                    await prisma.user.update({
                        where: { id: socket.data.userId },
                        data: { isOnline: data.isOnline },
                    });
                    if (data.isOnline) {
                        io.to('teammates').emit('teammate:online', {
                            teammateId: socket.data.userId,
                            username: socket.data.username,
                            game: socket.data.game || 'unknown',
                        });
                    }
                    else {
                        io.to('teammates').emit('teammate:offline', {
                            teammateId: socket.data.userId,
                            username: socket.data.username,
                        });
                    }
                }
                catch (error) {
                    console.error('Error updating teammate status:', error);
                }
            });
            // Handle disconnection
            socket.on('disconnect', async () => {
                console.log(`User ${socket.data.username} disconnected`);
                // Update user's online status
                await updateUserOnlineStatus(socket.data.userId, false);
                // Broadcast teammate offline if they're a pro
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
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.user.update({
            where: { id: userId },
            data: {
                isOnline,
                lastSeen: new Date(),
            },
        });
    }
    catch (error) {
        console.error('Error updating user online status:', error);
    }
}
async function broadcastQueueUpdate(game) {
    try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        // Get queue statistics
        const queueLength = await prisma.queueEntry.count({
            where: {
                game,
                status: 'waiting',
                paymentStatus: 'paid',
            },
        });
        const availableTeammates = await prisma.user.count({
            where: {
                game,
                isPro: true,
                isOnline: true,
                proSessions: {
                    none: {
                        status: {
                            in: ['Pending', 'Active'],
                        },
                    },
                },
            },
        });
        const estimatedWaitTime = Math.max(2, queueLength * 2); // 2 minutes per person
        // Broadcast to all users in the queue for this game
        const io = global.io;
        if (io) {
            io.to(`queue:${game}`).emit('queue:update', {
                queueLength,
                estimatedWaitTime,
                availableTeammates,
            });
        }
    }
    catch (error) {
        console.error('Error broadcasting queue update:', error);
    }
}
export async function notifyMatchFound(sessionId, clientId, teammateId) {
    try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                client: {
                    select: { username: true, rank: true },
                },
                proTeammate: {
                    select: { username: true, rank: true },
                },
            },
        });
        if (!session)
            return;
        const io = global.io;
        if (io) {
            // Notify client
            io.to(`user:${clientId}`).emit('match:found', {
                sessionId,
                teammate: {
                    id: session.proTeammateId,
                    username: session.proTeammate.username,
                    rank: session.proTeammate.rank || 'Unknown',
                },
            });
            // Notify teammate
            io.to(`user:${teammateId}`).emit('match:found', {
                sessionId,
                teammate: {
                    id: clientId,
                    username: session.client.username,
                    rank: session.client.rank || 'Unknown',
                },
            });
        }
    }
    catch (error) {
        console.error('Error notifying match found:', error);
    }
}
