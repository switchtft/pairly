'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface QueueStatus {
  isInQueue: boolean;
  queueLength: number;
  estimatedWaitTime: number;
  availableTeammates: number;
  matchFound: boolean;
  sessionId?: number;
  teammate?: any;
}

interface UseRealTimeQueueProps {
  game: string;
  onMatchFound?: (sessionId: number, teammate: any) => void;
  onQueueUpdate?: (status: QueueStatus) => void;
}

export function useRealTimeQueue({ 
  game, 
  onMatchFound, 
  onQueueUpdate 
}: UseRealTimeQueueProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<QueueStatus>({
    isInQueue: false,
    queueLength: 0,
    estimatedWaitTime: 0,
    availableTeammates: 0,
    matchFound: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for queue updates
  const pollQueueStatus = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/queue?game=${game}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch queue status');
      }

      const data = await response.json();
      
      const newStatus: QueueStatus = {
        isInQueue: status.isInQueue,
        queueLength: data.queueLength,
        estimatedWaitTime: data.estimatedWaitTime,
        availableTeammates: data.availableTeammates.length,
        matchFound: false
      };

      setStatus(newStatus);
      onQueueUpdate?.(newStatus);

    } catch (error) {
      console.error('Error polling queue status:', error);
    }
  }, [game, user, status.isInQueue, onQueueUpdate]);

  // Start polling when in queue
  useEffect(() => {
    if (status.isInQueue && !pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(pollQueueStatus, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [status.isInQueue, pollQueueStatus]);

  // Join queue
  const joinQueue = useCallback(async (duration: number, price: number, mode: string = 'duo') => {
    if (!user) {
      setError('Must be logged in to join queue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          game,
          duration,
          price,
          mode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join queue');
      }

      if (data.matchFound) {
        // Immediate match found
        setStatus(prev => ({
          ...prev,
          isInQueue: false,
          matchFound: true,
          sessionId: data.sessionId,
          teammate: data.teammate
        }));
        onMatchFound?.(data.sessionId, data.teammate);
      } else {
        // Added to queue
        setStatus(prev => ({
          ...prev,
          isInQueue: true,
          queueLength: prev.queueLength + 1
        }));
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join queue');
    } finally {
      setLoading(false);
    }
  }, [game, user, onMatchFound]);

  // Leave queue
  const leaveQueue = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/queue', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to leave queue');
      }

      setStatus(prev => ({
        ...prev,
        isInQueue: false,
        queueLength: Math.max(0, prev.queueLength - 1)
      }));

      // Stop polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to leave queue');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reset queue state
  const resetQueue = useCallback(() => {
    setStatus({
      isInQueue: false,
      queueLength: 0,
      estimatedWaitTime: 0,
      availableTeammates: 0,
      matchFound: false
    });
    setError(null);
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Initial queue status fetch
  useEffect(() => {
    if (user) {
      pollQueueStatus();
    }
  }, [user, game]);

  return {
    ...status,
    loading,
    error,
    joinQueue,
    leaveQueue,
    resetQueue,
    pollQueueStatus
  };
} 