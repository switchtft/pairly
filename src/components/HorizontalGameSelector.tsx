'use client';

import { useState, useRef } from 'react';
import Image from "next/image";
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Game = {
  id: string;
  name: string;
  imageUrl: string;
};

export default function HorizontalGameSelector({ 
  games,
  onGameSelect,
  selectedGameId
}: { 
  games: Game[];
  onGameSelect: (gameId: string) => void;
  selectedGameId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 300;
      containerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75"
      >
        <ChevronLeft size={24} />
      </button>
      
      <div 
        ref={containerRef}
        className="flex space-x-4 overflow-x-auto py-4 px-2 scrollbar-hide"
      >
        {games.map((game) => (
          <div 
            key={game.id}
            className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all duration-300 transform ${
              selectedGameId === game.id
                ? 'ring-4 ring-[#e6915b] scale-105'
                : 'ring-2 ring-transparent hover:ring-[#6b8ab0] hover:scale-102'
            }`}
            onClick={() => onGameSelect(game.id)}
          >
            <div className="relative h-20 w-32">
              <Image 
                src={game.imageUrl}
                alt={game.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-2 bg-[#2a2a2a]">
              <h4 className="text-sm font-semibold text-center">{game.name}</h4>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}