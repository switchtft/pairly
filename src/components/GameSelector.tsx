"use client";

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";

type Game = {
  id: string;
  name: string;
  imageUrl: string;
  playerCount: string;
  services: string[];
};

export default function GameSelector() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const games: Game[] = [
    {
      id: 'valorant',
      name: 'Valorant',
      imageUrl: '/images/games/valorant.jpg',
      playerCount: '5v5',
      services: ['Duo', 'Coaching', 'Inhouses', 'Tournaments']
    },
    {
      id: 'league',
      name: 'League of Legends',
      imageUrl: '/images/games/league.jpg',
      playerCount: '5v5',
      services: ['Duo', 'Coaching', 'Inhouses', 'Tournaments']
    },
    {
      id: 'csgo',
      name: 'CS:GO 2',
      imageUrl: '/images/games/csgo.jpg',
      playerCount: '5v5',
      services: ['Duo', 'Coaching', 'Inhouses', 'Tournaments']
    },
    {
      id: 'dota2',
      name: 'Dota 2',
      imageUrl: '/images/games/dota.jpg',
      playerCount: '5v5',
      services: ['Duo', 'Inhouses', 'Tournaments']
    },
    {
      id: 'overwatch',
      name: 'Overwatch 2',
      imageUrl: '/images/games/valorant.jpg', // Using placeholder
      playerCount: '5v5',
      services: ['Duo', 'Coaching', 'Inhouses']
    },
    {
      id: 'rocketleague',
      name: 'Rocket League',
      imageUrl: '/images/games/rocketleague.jpg',
      playerCount: '1-4 Players',
      services: ['Inhouses', 'Tournaments']
    },
    {
      id: 'fortnite',
      name: 'Fortnite',
      imageUrl: '/images/games/fortnite.jpg',
      playerCount: '1-4 Players',
      services: ['Duo', 'Inhouses', 'Tournaments']
    },
    {
      id: 'apex',
      name: 'Apex Legends',
      imageUrl: '/images/games/valorant.jpg', // Using placeholder
      playerCount: '3v3',
      services: ['Duo', 'Inhouses', 'Tournaments']
    },
    {
      id: 'rainbow6',
      name: 'Rainbow Six Siege',
      imageUrl: '/images/games/league.jpg', // Using placeholder
      playerCount: '5v5',
      services: ['Duo', 'Coaching', 'Inhouses']
    },
  ];

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add "More coming soon!" card to filtered games
  const gamesWithMore = [...filteredGames, { id: 'more', name: 'More coming soon!', imageUrl: '', playerCount: '', services: [] }];

  const gamesPerPage = 3;
  const totalPages = Math.ceil(gamesWithMore.length / gamesPerPage);

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'Inhouses':
      case 'Duo':
        return 'bg-[#e6915b]/20 text-[#e6915b]';
      case 'Tournaments':
        return 'bg-[#d4a574]/20 text-[#d4a574]';
      case 'Coaching':
        return 'bg-[#b8860b]/20 text-[#b8860b]';
      default:
        return 'bg-[#e6915b]/20 text-[#e6915b]';
    }
  };

  const scrollToPage = (page: number) => {
    if (scrollContainerRef.current) {
      const scrollAmount = page * gamesPerPage * 320 + page * 24; // 320px per game + 24px gap
      scrollContainerRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      setCurrentPage(page);
    }
  };

  const scrollLeft = () => {
    if (currentPage > 0) {
      scrollToPage(currentPage - 1);
    }
  };

  const scrollRight = () => {
    if (currentPage < totalPages - 1) {
      scrollToPage(currentPage + 1);
    }
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [searchQuery]);

  return (
    <section id="games" className="py-20 bg-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-3xl font-bold mb-4 text-center">Games We Support</h3>
        <p className="text-center text-[#e6915b]/80 mb-8 max-w-2xl mx-auto">
          Find your favorite game and join our free Inhouses, duo matching, tournaments, and coaching services!
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e6915b] w-5 h-5" />
          <input
            type="text"
            placeholder="Search for a game..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2a2a2a] text-white pl-10 pr-4 py-3 rounded-lg border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#d4a574] focus:border-transparent"
          />
        </div>
        
        {/* Fixed 3-Game Viewport with Navigation */}
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            disabled={currentPage === 0}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-[#2a2a2a] hover:bg-[#333] text-[#e6915b] p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
              currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeft size={24} />
          </button>
          
          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            disabled={currentPage === totalPages - 1}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-[#2a2a2a] hover:bg-[#333] text-[#e6915b] p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
              currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ChevronRight size={24} />
          </button>
          
          {/* Fixed Viewport Container */}
          <div className="overflow-hidden">
            <div 
              ref={scrollContainerRef}
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentPage * (3 * 320 + 2 * 24)}px)`,
                width: `${gamesWithMore.length * 320 + (gamesWithMore.length - 1) * 24}px`
              }}
            >
              {gamesWithMore.map((game) => (
                <div 
                  key={game.id}
                  className="flex-shrink-0 w-80 bg-[#2a2a2a] rounded-xl overflow-hidden hover:bg-[#333] transition-all duration-300 transform hover:scale-105"
                >
                  {game.id === 'more' ? (
                    // More coming soon card
                    <div className="h-48 bg-gradient-to-br from-[#e6915b]/20 to-[#d4a574]/20 flex items-center justify-center">
                      <div className="text-center">
                        <Plus size={48} className="text-[#e6915b] mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-[#e6915b]">More coming soon!</h4>
                        <p className="text-[#e6915b]/80 text-sm mt-2">We&apos;re adding more games</p>
                      </div>
                    </div>
                  ) : (
                    // Regular game card
                    <div className="relative h-48">
                      <Image 
                        src={game.imageUrl}
                        alt={game.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-center mb-2">{game.name}</h4>
                    {game.id !== 'more' && (
                      <>
                        <p className="text-[#e6915b]/80 text-sm text-center mb-4 font-medium">{game.playerCount}</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {game.services.map((service) => (
                            <span 
                              key={service}
                              className={`${getServiceColor(service)} text-xs px-3 py-1 rounded-full font-medium`}
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Scroll Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => scrollToPage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentPage ? 'bg-[#e6915b]' : 'bg-[#333] hover:bg-[#555]'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-[#e6915b]/80 mb-4">
            Don&apos;t see your game? Let us know and we&apos;ll add it!
          </p>
          <button className="bg-gradient-to-r from-[#e6915b] to-[#a8724c] hover:from-[#d8824a] hover:to-[#976040] text-white px-6 py-2 rounded-lg transition-all">
            Request Game
          </button>
        </div>
      </div>
    </section>
  );
}