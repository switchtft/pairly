'use client';

import React from 'react';
import { Game } from '@/lib/duo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GameSelectorProps {
  games: Game[];
  selectedGameId: number;
  onGameSelect: (gameId: number) => void;
  showPostCounts?: boolean;
  isAdmin?: boolean;
}

export function GameSelector({
  games,
  selectedGameId,
  onGameSelect,
  showPostCounts = false,
  isAdmin = false
}: GameSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {games.map((game) => (
        <Button
          key={game.id}
          variant={selectedGameId === game.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onGameSelect(game.id)}
          className={cn(
            'flex items-center gap-2 transition-colors',
            selectedGameId === game.id 
              ? 'bg-[#e6915b] hover:bg-[#d8824a] text-white' 
              : 'border-[#e6915b] text-[#e6915b] hover:bg-[#e6915b] hover:text-white'
          )}
        >
          <span>{game.name}</span>
          {showPostCounts && isAdmin && (
            <Badge variant="secondary" className="ml-1 bg-[#2a2a2a] text-[#e6915b] border border-[#e6915b]/30">
              {game._count?.posts || 0}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}
