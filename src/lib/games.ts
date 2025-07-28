// src/lib/games.ts
export interface Game {
  id: string;
  name: string;
  imageUrl?: string; // Make optional
  description?: string;
}

export const GAMES: Game[] = [
  { id: 'lol', name: 'League of Legends!!', imageUrl: '/images/games/league.jpg' },
  { id: 'valorant', name: 'Valorant', imageUrl: '/images/games/valorant.jpg' },
  { id: 'csgo', name: 'CS:GO 2', imageUrl: '/images/games/csgo.jpg' },
];