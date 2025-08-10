'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  ServerToClientEvents, 
  ClientToServerEvents,
  InterServerEvents,
  SocketData 
} from '@/lib/socket';

interface UseSocketReturn {
  socket: Socket<ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData> | null;
  isConnected: boolean;
  joinQueue: (game: string, gameMode: string) => void;
  leaveQueue: () => void;
  sendChatMessage: (sessionId: string, content: string) => void;
  joinSession: (sessionId: string) => void;
  updateTeammateStatus: (isOnline: boolean) => void;
}

export function useSocket(): UseSocketReturn {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData> | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Get token from cookies
    const getToken = () => {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
    };

    const token = getToken();
    if (!token) return;

    // Create socket connection
    const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  // Socket event handlers
  const joinQueue = useCallback((game: string, gameMode: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('queue:join', { game, gameMode });
    }
  }, [isConnected]);

  const leaveQueue = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('queue:leave');
    }
  }, [isConnected]);

  const sendChatMessage = useCallback((sessionId: string, content: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('chat:send', { sessionId, content });
    }
  }, [isConnected]);

  const joinSession = useCallback((sessionId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('session:join', { sessionId });
    }
  }, [isConnected]);

  const updateTeammateStatus = useCallback((isOnline: boolean) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('teammate:status', { isOnline });
    }
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    joinQueue,
    leaveQueue,
    sendChatMessage,
    joinSession,
    updateTeammateStatus,
  };
}

// Hook for listening to specific socket events
export function useSocketEvent<T extends keyof ServerToClientEvents>(
  event: T,
  callback: ServerToClientEvents[T]
) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);
} 