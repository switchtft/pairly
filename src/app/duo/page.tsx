// src/app/duo/page.tsx
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Users, Crown, Shield, Star, Plus, X, Wifi, WifiOff, DollarSign, Tag, CheckCircle, Gamepad2 } from 'lucide-react';
import { calculateBundleDiscount, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import EnhancedChatInterface from '@/components/EnhancedChatInterface';
import Image from 'next/image';
import React from 'react';

// Simplified components to avoid import issues
function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div 
      className="animate-spin rounded-full border-2 border-current border-t-transparent"
      style={{ width: size, height: size }}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-600 rounded w-24"></div>
          <div className="h-3 bg-gray-600 rounded w-16"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-600 rounded w-20"></div>
        <div className="h-3 bg-gray-600 rounded w-16"></div>
      </div>
    </div>
  );
}

function EmptyState({ 
  icon: Icon, 
  title, 
  message 
}: { 
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string; 
  message: string; 
}) {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

// Visual game selector with larger images
function GameSelector({ selectedGame, onGameSelect }: {
  selectedGame: string;
  onGameSelect: (game: string) => void;
}) {
  const games = [
    { id: 'valorant', name: 'Valorant', image: '/images/games/valorant.jpg' },
    { id: 'league', name: 'League of Legends', image: '/images/games/league.jpg' },
    { id: 'csgo', name: 'CS:GO 2', image: '/images/games/csgo.jpg' },
  ];

  return (
    <div className="flex justify-center gap-8 mb-8">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onGameSelect(game.id)}
          className={`flex flex-col items-center gap-4 transition-all ${
            selectedGame === game.id
              ? 'scale-105'
              : 'hover:scale-105'
          }`}
        >
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden">
            <Image
              src={game.image}
              alt={game.name}
              fill
              className="object-cover"
            />
            {selectedGame === game.id && (
              <div className="absolute inset-0 bg-[#e6915b]/20 border-2 border-[#e6915b] rounded-2xl" />
            )}
          </div>
          <span className={`font-medium text-base ${
            selectedGame === game.id ? 'text-[#e6915b]' : 'text-gray-400'
          }`}>
            {game.name}
          </span>
        </button>
      ))}
    </div>
  );
}

// Integrated booking form
function BookingForm({ game, onBookingComplete }: { 
  game: string; 
  onBookingComplete: (queueEntryId: number) => void;
}) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedGameMode, setSelectedGameMode] = useState<any>(null);
  const [numberOfMatches, setNumberOfMatches] = useState(1);
  const [teammatesNeeded, setTeammatesNeeded] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const GAME_MODES: Record<string, any[]> = {
    valorant: [
      { id: 'unrated', name: 'Unrated', description: 'Casual matches for practice', basePrice: 15 },
      { id: 'ranked', name: 'Ranked', description: 'Competitive ranked matches', basePrice: 20 },
      { id: 'ltms', name: 'LTMs', description: 'Limited Time Modes', basePrice: 12 },
      { id: 'customs', name: 'Customs', description: 'Custom game modes', basePrice: 10 },
    ],
    league: [
      { id: 'ranked-solo-duo', name: 'Ranked Solo/Duo', description: 'Solo or duo queue ranked', basePrice: 18 },
      { id: 'ranked-flex', name: 'Ranked Flex', description: 'Flex queue ranked (3-5 players)', basePrice: 16 },
      { id: 'ltms', name: 'LTMs', description: 'Limited Time Modes', basePrice: 12 },
      { id: 'customs', name: 'Customs', description: 'Custom game modes', basePrice: 10 },
      { id: 'draft', name: 'Draft', description: 'Draft pick games', basePrice: 14 },
    ],
    csgo: [
      { id: 'competitive', name: 'Competitive', description: '5v5 competitive matches', basePrice: 18 },
      { id: 'casual', name: 'Casual', description: 'Casual 10v10 matches', basePrice: 12 },
      { id: 'deathmatch', name: 'Deathmatch', description: 'Fast-paced deathmatch', basePrice: 10 },
      { id: 'customs', name: 'Customs', description: 'Custom game modes', basePrice: 8 },
    ],
  };

  const gameModes = GAME_MODES[game] || [];

  // Calculate pricing
  const basePrice = selectedGameMode?.basePrice || 0;
  const totalBasePrice = basePrice * numberOfMatches;
  const discountAmount = discountInfo?.discountAmount || 0;
  const finalPrice = Math.max(0, totalBasePrice - discountAmount);

  // Validate discount code
  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) return;
    
    try {
      const response = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.trim(),
          amount: totalBasePrice,
          game: game
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setDiscountInfo({
          code: data.code,
          discountAmount: data.discountAmount,
          discountType: data.discountType,
        });
        setError(null);
      } else {
        setDiscountInfo(null);
        setError(data.error || 'Invalid discount code');
      }
    } catch (error) {
      setDiscountInfo(null);
      setError('Failed to validate discount code');
    }
  };

  // Handle discount code submission
  const handleDiscountCodeSubmit = () => {
    validateDiscountCode(discountCode);
  };

  // Create booking
  const handleCreateBooking = async () => {
    if (!selectedGameMode) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game,
          gameMode: selectedGameMode.id,
          numberOfMatches,
          teammatesNeeded,
          pricePerMatch: selectedGameMode.basePrice,
          totalPrice: finalPrice,
          specialRequests: specialRequests.trim() || undefined,
          discountCode: discountInfo?.code || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.paymentRequired) {
          // Handle Stripe payment flow
          alert('Payment required - Stripe integration needed');
        } else {
          // Payment not required, booking completed
          onBookingComplete(data.queueEntryId);
          // Reset form
          setStep(1);
          setSelectedGameMode(null);
          setNumberOfMatches(1);
          setTeammatesNeeded(1);
          setSpecialRequests('');
          setDiscountCode('');
          setDiscountInfo(null);
          setError(null);
        }
      } else {
        if (data.error === 'Already in queue') {
          // Try to clear existing queue entry first
          try {
            await fetch('/api/queue', { method: 'DELETE' });
            // Retry the booking after clearing
            setTimeout(() => handleCreateBooking(), 1000);
            return;
          } catch (clearError) {
            setError('Failed to clear existing queue entry. Please try again.');
          }
        } else {
          setError(data.error || 'Failed to create booking');
        }
      }
    } catch (error) {
      setError('Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl p-6 border border-[#e6915b]/20 mb-8 text-center">
        <div className="bg-[#e6915b]/10 rounded-xl p-4 mb-4">
          <Crown className="w-8 h-8 text-[#e6915b] mx-auto mb-2" />
          <h3 className="text-[#e6915b] font-semibold text-lg">Book Your Gaming Session</h3>
        </div>
        <p className="text-[#e6915b]/60 mb-4">Please log in to book a session</p>
        <Button className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]">
          Login to Book
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl border border-[#e6915b]/20 mb-8 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#e6915b]/10 to-[#e6915b]/5 p-6 border-b border-[#e6915b]/20">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6915b]/20 p-2 rounded-lg">
            <Crown className="w-6 h-6 text-[#e6915b]" />
          </div>
          <h3 className="text-[#e6915b] font-semibold text-xl">Book Your Gaming Session</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Step 1: Game Mode Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-[#e6915b] mb-4 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Select Game Mode
              </h4>
              <div className="grid gap-3">
                {gameModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedGameMode(mode)}
                    className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-[1.02] ${
                      selectedGameMode?.id === mode.id
                        ? 'border-[#e6915b] bg-gradient-to-r from-[#e6915b]/10 to-[#e6915b]/5'
                        : 'border-[#e6915b]/30 hover:border-[#e6915b]/50 bg-[#1a1a1a]/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <h5 className="font-semibold text-[#e6915b]">{mode.name}</h5>
                        <span className="text-[#e6915b]/60 text-sm">• {mode.description}</span>
                      </div>
                      <span className="text-[#e6915b]/80 font-medium bg-[#e6915b]/10 px-2 py-1 rounded">
                        ${mode.basePrice}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedGameMode}
                className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a] px-6"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Session Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-[#e6915b] mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Session Details
              </h4>
              
              {/* Number of Matches and Teammates in parallel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Number of Matches */}
                <div>
                  <label className="block text-[#e6915b]/80 mb-3 font-medium">
                    Number of Matches
                  </label>
                  <div className="flex items-center gap-4 bg-[#1a1a1a] rounded-lg p-4">
                    <button
                      onClick={() => setNumberOfMatches(Math.max(1, numberOfMatches - 1))}
                      className="w-10 h-10 rounded-lg bg-[#e6915b]/20 text-[#e6915b] hover:bg-[#e6915b]/30 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-[#e6915b] min-w-[3rem] text-center">
                      {numberOfMatches}
                    </span>
                    <button
                      onClick={() => setNumberOfMatches(Math.min(10, numberOfMatches + 1))}
                      className="w-10 h-10 rounded-lg bg-[#e6915b]/20 text-[#e6915b] hover:bg-[#e6915b]/30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Teammates Needed */}
                <div>
                  <label className="block text-[#e6915b]/80 mb-3 font-medium">
                    Teammates Needed
                  </label>
                  <div className="flex items-center gap-4 bg-[#1a1a1a] rounded-lg p-4">
                    <button
                      onClick={() => setTeammatesNeeded(Math.max(1, teammatesNeeded - 1))}
                      className="w-10 h-10 rounded-lg bg-[#e6915b]/20 text-[#e6915b] hover:bg-[#e6915b]/30 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-[#e6915b] min-w-[3rem] text-center">
                      {teammatesNeeded}
                    </span>
                    <button
                      onClick={() => setTeammatesNeeded(Math.min(5, teammatesNeeded + 1))}
                      className="w-10 h-10 rounded-lg bg-[#e6915b]/20 text-[#e6915b] hover:bg-[#e6915b]/30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="mb-6">
                <label className="block text-[#e6915b]/80 mb-3 font-medium">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any specific requirements or preferences..."
                  className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#e6915b]/30 text-[#e6915b] placeholder-[#e6915b]/40 focus:border-[#e6915b] focus:outline-none transition-colors"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b]/10 hover:border-[#e6915b]/50 bg-transparent"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a] px-6"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-[#e6915b] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment & Discount
              </h4>

              {/* Order Summary */}
              <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6 border border-[#e6915b]/20">
                <h5 className="font-semibold text-[#e6915b] mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Order Summary
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#e6915b]/80">Game Mode:</span>
                    <span className="text-[#e6915b]">{selectedGameMode?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#e6915b]/80">Matches:</span>
                    <span className="text-[#e6915b]">{numberOfMatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#e6915b]/80">Teammates:</span>
                    <span className="text-[#e6915b]">{teammatesNeeded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#e6915b]/80">Price per match:</span>
                    <span className="text-[#e6915b]">${selectedGameMode?.basePrice}</span>
                  </div>
                  <div className="border-t border-[#e6915b]/20 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-[#e6915b]">Subtotal:</span>
                      <span className="text-[#e6915b]">${totalBasePrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <label className="block text-[#e6915b]/80 mb-3 font-medium">
                  Discount Code (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter discount code..."
                    className="flex-1 p-3 rounded-lg bg-[#1a1a1a] border border-[#e6915b]/30 text-[#e6915b] placeholder-[#e6915b]/40 focus:border-[#e6915b] focus:outline-none transition-colors"
                  />
                  <Button
                    onClick={handleDiscountCodeSubmit}
                    disabled={!discountCode.trim()}
                    className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]"
                  >
                    Apply
                  </Button>
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
                {discountInfo && (
                  <div className="flex items-center gap-2 mt-2 text-green-400 bg-green-400/10 p-2 rounded">
                    <CheckCircle size={16} />
                    <span className="text-sm">
                      Discount applied: -${discountInfo.discountAmount}
                    </span>
                  </div>
                )}
              </div>

              {/* Final Price */}
              <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6 border border-[#e6915b]/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#e6915b]">Total:</span>
                  <span className="text-2xl font-bold text-[#e6915b]">
                    ${finalPrice}
                  </span>
                </div>
                {discountInfo && (
                  <p className="text-sm text-[#e6915b]/60 mt-1">
                    You saved ${discountInfo.discountAmount}!
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b]/10 hover:border-[#e6915b]/50 bg-transparent"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateBooking}
                disabled={isLoading}
                className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a] flex items-center gap-2 px-6"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign size={16} />
                    Pay ${finalPrice}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Types for database users
interface DbUser {
  id: number;
  username: string;
  rank: string | null;
  game: string | null;
  role: string | null;
  isPro: boolean;
  createdAt: string;
}

interface Player {
  id: string;
  name: string;
  rank: string;
  winRate: string;
  mainRole: string;
  secondaryRole: string;
  online: boolean;
  lastOnline: string;
  personalPrice: string;
  inQueue: boolean;
  queuePrice: string;
  game: string;
  verified?: boolean;
  rating: number; // Star rating out of 5
}

function convertDbUserToPlayer(dbUser: DbUser): Player {
  return {
    id: dbUser.id.toString(),
    name: dbUser.username,
    rank: dbUser.rank || 'Unranked',
    winRate: '65%', // Mock data
    mainRole: dbUser.role || 'Flex',
    secondaryRole: 'Support',
    online: true, // Mock data
    lastOnline: '2 minutes ago',
    personalPrice: '$25',
    inQueue: false,
    queuePrice: '$20',
    game: dbUser.game || 'valorant',
    verified: true, // Mock data
    rating: 4.5, // Mock rating
  };
}

function PlayerCard({ player }: { player: Player }) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-400" />);
    }

    return stars;
  };

  return (
    <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 p-5 hover:border-[#e6915b]/50 transition-all">
      {/* Player Image and Name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#e6915b] to-[#d17a4a] rounded-full flex items-center justify-center">
          <span className="text-[#1a1a1a] font-bold text-xl">
            {player.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[#e6915b] text-lg">{player.name}</h3>
            {player.verified && (
              <Shield className="w-4 h-4 text-[#e6915b]" />
            )}
          </div>
          <p className="text-[#e6915b]/60 text-sm">{player.rank}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${player.online ? 'bg-green-500' : 'bg-gray-500'}`} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[#e6915b]/60 text-sm">Win Rate</p>
          <p className="text-[#e6915b] font-semibold">{player.winRate}</p>
        </div>
        <div>
          <p className="text-[#e6915b]/60 text-sm">Main Role</p>
          <p className="text-[#e6915b] font-semibold">{player.mainRole}</p>
        </div>
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {renderStars(player.rating)}
        </div>
        <span className="text-[#e6915b] text-sm font-medium">
          {player.rating.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

export default function DuoPage() {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState('valorant');
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [queueStats, setQueueStats] = useState({
    queueLength: 0,
    estimatedWaitTime: 0,
    availableTeammates: 0,
  });

  // WebSocket connection
  const { isConnected, joinQueue: joinSocketQueue, leaveQueue: leaveSocketQueue } = useSocket();

  // Real-time queue updates
  useSocketEvent('queue:update', (data) => {
    console.log('Queue update received:', data);
    setQueueStats(data);
  });

  // Real-time match notifications
  useSocketEvent('match:found', (data) => {
    setCurrentSessionId(data.sessionId);
    setShowChat(true);
    alert(`🎉 Match found! You've been paired with ${data.teammate.username} (${data.teammate.rank})`);
  });

  // Real-time teammate status updates
  useSocketEvent('teammate:online', (data) => {
    console.log(`Teammate ${data.username} is now online for ${data.game}`);
    // You could update the players list here to show real-time status
  });

  useSocketEvent('teammate:offline', (data) => {
    console.log(`Teammate ${data.username} is now offline`);
    // You could update the players list here to show real-time status
  });

  // Fetch players from database
  const fetchPlayers = useCallback(async (game?: string) => {
    console.log('Fetching players for game:', game);
    setLoadingPlayers(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (game) params.append('game', game);
      
      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch players`);
      }
      
      const dbUsers: DbUser[] = await response.json();
      const convertedPlayers = dbUsers.map(convertDbUserToPlayer);
      setPlayers(convertedPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to load players. Please try again.');
      setPlayers([]);
    } finally {
      setLoadingPlayers(false);
    }
  }, []);

  // Load players on mount and game change
  useEffect(() => {
    fetchPlayers(selectedGame);
  }, [selectedGame, fetchPlayers]);

  // Join WebSocket queue when game changes
  useEffect(() => {
    if (isConnected && user) {
      joinSocketQueue(selectedGame, 'duo');
    }
  }, [isConnected, selectedGame, user, joinSocketQueue]);

  // Filter players by selected game
  const filteredPlayers = useMemo(() => {
    return players.filter(p => p.game === selectedGame);
  }, [players, selectedGame]);

  // Get online players count
  const onlinePlayersCount = useMemo(() => {
    return players.filter(p => p.online && p.game === selectedGame).length;
  }, [players, selectedGame]);

  // Handle booking completion
  const handleBookingComplete = useCallback((queueEntryId: number) => {
    console.log('Booking completed, queue entry ID:', queueEntryId);
    // The user is now in the queue, you can show queue status or redirect
    alert('Booking completed! You are now in the queue.');
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] min-h-screen pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#e6915b] mb-3">
            Find Your Perfect Duo Partner
          </h1>
          <p className="text-[#e6915b]/80 max-w-2xl mx-auto text-lg">
            Connect with skilled players who match your playstyle
          </p>
        </div>

        {/* Game Selector */}
        <GameSelector selectedGame={selectedGame} onGameSelect={setSelectedGame} />

        {/* Booking Form */}
        <BookingForm game={selectedGame} onBookingComplete={handleBookingComplete} />

        {/* Players Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#e6915b] mb-6 flex items-center gap-3">
            Available Players
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-lg">{onlinePlayersCount} Online</span>
            </div>
          </h2>
          
          {loadingPlayers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={Users}
              title="Failed to load players"
              message={error}
            />
          ) : filteredPlayers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No players available"
              message="Check back later for available players"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                />
              ))}
            </div>
          )}
        </div>

        {/* Queue Status */}
        {queueStats.queueLength > 0 && (
          <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#e6915b]/30 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#e6915b] font-semibold text-lg mb-2">
                  Queue Status
                </h3>
                <p className="text-[#e6915b]/60">
                  {queueStats.queueLength} people in queue • {queueStats.availableTeammates} teammates available
                </p>
                <p className="text-[#e6915b]/60">
                  Estimated wait time: {queueStats.estimatedWaitTime} minutes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Live Updates</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {showChat && currentSessionId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 w-full max-w-2xl h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#e6915b]/20">
              <h3 className="text-[#e6915b] font-semibold">Chat with your teammate</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-[#e6915b]/60 hover:text-[#e6915b]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4">
              <EnhancedChatInterface 
                sessionId={currentSessionId} 
                teammate={{
                  id: 1, // This would come from the actual session data
                  username: "ProTeammate",
                  rank: "Diamond",
                  isOnline: true
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}