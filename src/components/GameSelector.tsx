"use client";

import { useState } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";

type Game = {
  id: string;
  name: string;
  imageUrl: string;
  priceOptions: {
    id: string;
    label: string;
    price: string;
  }[];
};

export default function GameSelector() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  
  const games: Game[] = [
    {
      id: 'valorant',
      name: 'Valorant',
      imageUrl: '/images/games/valorant.jpg',
      priceOptions: [
        { id: '1', label: '1 Hour Duo', price: '$10' },
        { id: '2', label: '2 Hours Duo', price: '$18' },
        { id: '3', label: 'Coaching Session', price: '$25' },
      ],
    },
    {
      id: 'league',
      name: 'League of Legends',
      imageUrl: '/images/games/league.jpg',
      priceOptions: [
        { id: '1', label: '1 Hour Duo', price: '$12' },
        { id: '2', label: '2 Hours Duo', price: '$20' },
        { id: '3', label: 'Coaching Session', price: '$30' },
      ],
    },
    {
      id: 'csgo',
      name: 'CS:GO',
      imageUrl: '/images/games/csgo.jpg',
      priceOptions: [
        { id: '1', label: '1 Hour Duo', price: '$8' },
        { id: '2', label: '2 Hours Duo', price: '$15' },
        { id: '3', label: 'Coaching Session', price: '$22' },
      ],
    },
  ];

  return (
    <section id="games" className="py-20 bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-3xl font-bold mb-12 text-center">Select Your Game</h3>
        
        {/* Game Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {games.map((game) => (
            <div 
              key={game.id}
              className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform ${
                selectedGame?.id === game.id
                  ? 'ring-4 ring-[#e6915b] scale-105'
                  : 'ring-2 ring-transparent hover:ring-[#6b8ab0] hover:scale-102'
              }`}
              onClick={() => setSelectedGame(game)}
            >
              <div className="relative h-48">
                <Image 
                  src={game.imageUrl}
                  alt={game.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 bg-[#2a2a2a]">
                <h4 className="text-xl font-semibold text-center">{game.name}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Price Options */}
        {selectedGame && (
          <div className="mt-16 animate-fadeIn">
            <h4 className="text-2xl font-bold mb-6 text-center text-[#e6915b]">
              {selectedGame.name} Services
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedGame.priceOptions.map((option) => (
                <div 
                  key={option.id} 
                  className="bg-[#2a2a2a] rounded-xl p-6 hover:bg-[#333] transition border border-[#6b8ab0]/30"
                >
                  <h5 className="text-lg font-semibold mb-2">{option.label}</h5>
                  <p className="text-2xl font-bold mb-4 text-[#e6915b]">{option.price}</p>
                  <Button className="w-full bg-gradient-to-r from-[#6b8ab0] to-[#8a675e] hover:from-[#5a79a0] hover:to-[#79564e]">
                    Select Option
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}