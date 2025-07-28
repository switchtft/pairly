// src/components/LoadingStates.tsx
'use client';

import { Loader2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Generic loading spinner
export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <Loader2 
      size={size} 
      className={`animate-spin text-[#e6915b] ${className}`} 
    />
  );
}

// Card skeleton for loading states
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className="bg-[#1a1a1a] rounded-2xl border-2 border-[#2a2a2a] p-6 animate-pulse"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#2a2a2a] rounded-lg w-12 h-12"></div>
              <div>
                <div className="bg-[#2a2a2a] h-6 w-32 rounded mb-2"></div>
                <div className="bg-[#2a2a2a] h-4 w-24 rounded"></div>
              </div>
            </div>
            <div className="bg-[#2a2a2a] h-6 w-16 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <div className="h-4 w-16 bg-[#333] rounded mb-2"></div>
              <div className="h-6 w-20 bg-[#333] rounded"></div>
            </div>
            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <div className="h-4 w-16 bg-[#333] rounded mb-2"></div>
              <div className="h-6 w-20 bg-[#333] rounded"></div>
            </div>
            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <div className="h-4 w-16 bg-[#333] rounded mb-2"></div>
              <div className="h-6 w-20 bg-[#333] rounded"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 bg-[#2a2a2a] rounded"></div>
            <div className="h-10 w-24 bg-[#2a2a2a] rounded-lg"></div>
          </div>
        </div>
      ))}
    </>
  );
}

// Full page loading state
export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <LoadingSpinner size={48} className="mb-4" />
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  );
}

// Error state component
export function ErrorState({ 
  title = "Something went wrong",
  message = "We're having trouble loading this content. Please try again.",
  onRetry,
  showRetry = true
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  return (
    <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
      <div className="bg-red-900/20 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{message}</p>
      {showRetry && onRetry && (
        <Button 
          onClick={onRetry}
          className="bg-[#e6915b] hover:bg-[#d18251] px-6 py-3 flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({
  icon: Icon = AlertCircle,
  title = "No results found",
  message = "Try adjusting your search or filters to find what you're looking for.",
  actionLabel,
  onAction,
  showAction = false
}: {
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}) {
  return (
    <div className="text-center py-20 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
      <div className="bg-gray-800 w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6">
        <Icon className="h-12 w-12 text-gray-400" size={48} />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{message}</p>
      {showAction && actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] px-8 py-3"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}