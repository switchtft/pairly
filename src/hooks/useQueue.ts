// src/hooks/useQueue.ts
'use client';

import { useState, useCallback } from 'react';

interface UseQueueProps {
  onMatchFound?: () => void;
  minMatchTime?: number;
  maxMatchTime?: number;
}

export function useQueue({ 
  onMatchFound, 
  minMatchTime = 8000, 
  maxMatchTime = 15000 
}: UseQueueProps = {}) {
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [matchFound, setMatchFound] = useState(false);
  const [searching, setSearching] = useState(false);

  const joinQueue = useCallback(() => {
    setSearching(true);
    setIsInQueue(true);
    setQueueTime(0);
    setMatchFound(false);
    
    // Start queue timer
    const timer = setInterval(() => {
      setQueueTime(prev => prev + 1);
    }, 1000);
    
    // Simulate match found after random time
    const matchTime = minMatchTime + Math.random() * (maxMatchTime - minMatchTime);
    const matchTimer = setTimeout(() => {
      setMatchFound(true);
      setSearching(false);
      clearInterval(timer);
      onMatchFound?.();
    }, matchTime);

    // Cleanup function
    return () => {
      clearInterval(timer);
      clearTimeout(matchTimer);
    };
  }, [minMatchTime, maxMatchTime, onMatchFound]);

  const leaveQueue = useCallback(() => {
    setIsInQueue(false);
    setMatchFound(false);
    setQueueTime(0);
    setSearching(false);
  }, []);

  const resetQueue = useCallback(() => {
    setIsInQueue(false);
    setMatchFound(false);
    setQueueTime(0);
    setSearching(false);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isInQueue,
    queueTime,
    matchFound,
    searching,
    joinQueue,
    leaveQueue,
    resetQueue,
    formatTime: () => formatTime(queueTime),
  };
}