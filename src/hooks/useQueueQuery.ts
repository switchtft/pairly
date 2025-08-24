'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

// --- API Helper Functions (assuming these are in a file like `@/lib/queue.ts`) ---

interface QueueStatus {
  isInQueue: boolean;
  queueLength: number;
  estimatedWaitTime: number;
  availableTeammates: number;
  matchFound: boolean;
  sessionId?: number;
  teammate?: { id: number; username: string; rank: string };
}

interface JoinQueuePayload {
  game: string;
  duration: number;
  price: number;
  mode: string;
}

async function fetchQueueStatus(game: string): Promise<QueueStatus> {
  const response = await fetch(`/api/queue?game=${game}`);
  if (!response.ok) {
    throw new Error('Failed to fetch queue status');
  }
  return response.json();
}

async function joinQueue(payload: JoinQueuePayload): Promise<QueueStatus> {
  const response = await fetch('/api/queue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to join queue');
  }
  return data;
}

async function leaveQueue(): Promise<void> {
  const response = await fetch('/api/queue', { method: 'DELETE' });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to leave queue');
  }
}


// --- TanStack Query Hook ---

const queryKeys = {
  queueStatus: (game: string) => ['queueStatus', game] as const,
};

interface UseQueueProps {
  game: string;
  onMatchFound?: (data: QueueStatus) => void;
}

export function useQueue({ game, onMatchFound }: UseQueueProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // useQuery handles fetching, caching, and background polling automatically.
  const { data: status, error, isLoading } = useQuery<QueueStatus, Error>({
    queryKey: queryKeys.queueStatus(game),
    queryFn: () => fetchQueueStatus(game),
    // This enables automatic, efficient background polling when the user is on the page.
    refetchInterval: 3000,
    // Only run this query if the user is logged in.
    enabled: !!user,
    // Listen for changes and trigger the onMatchFound callback.
    onSuccess: (data) => {
      if (data.matchFound && onMatchFound) {
        onMatchFound(data);
      }
    },
  });

  // useMutation handles the server-side state changes for joining the queue.
  const joinQueueMutation = useMutation({
    mutationFn: (payload: Omit<JoinQueuePayload, 'game'>) => joinQueue({ ...payload, game }),
    onSuccess: (data) => {
      // When the mutation is successful, update the local cache immediately
      // to provide a fast UI response, then invalidate the query to refetch
      // the latest status from the server.
      queryClient.setQueryData(queryKeys.queueStatus(game), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.queueStatus(game) });
    },
  });

  // useMutation for leaving the queue.
  const leaveQueueMutation = useMutation({
    mutationFn: leaveQueue,
    onSuccess: () => {
      // Immediately update the UI to reflect that the user is no longer in the queue.
      queryClient.setQueryData(queryKeys.queueStatus(game), (oldData: QueueStatus | undefined) => ({
        ...(oldData ?? {}),
        isInQueue: false,
        matchFound: false,
      }));
      // Refetch the actual queue status in the background.
      queryClient.invalidateQueries({ queryKey: queryKeys.queueStatus(game) });
    },
  });

  // A simple reset function to clear the state if needed.
  const resetQueue = useCallback(() => {
    queryClient.setQueryData(queryKeys.queueStatus(game), {
      isInQueue: false,
      queueLength: 0,
      estimatedWaitTime: 0,
      availableTeammates: 0,
      matchFound: false,
    });
  }, [queryClient, game]);

  return {
    // Status from useQuery
    isInQueue: status?.isInQueue ?? false,
    queueLength: status?.queueLength ?? 0,
    estimatedWaitTime: status?.estimatedWaitTime ?? 0,
    availableTeammates: status?.availableTeammates ?? 0,
    matchFound: status?.matchFound ?? false,
    sessionId: status?.sessionId,
    teammate: status?.teammate,
    isLoading: isLoading || joinQueueMutation.isPending || leaveQueueMutation.isPending,
    error: error || joinQueueMutation.error || leaveQueueMutation.error,

    // Actions from useMutation
    joinQueue: joinQueueMutation.mutateAsync,
    leaveQueue: leaveQueueMutation.mutateAsync,
    resetQueue,
  };
}
