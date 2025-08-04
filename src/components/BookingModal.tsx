'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Users, Clock, DollarSign, Tag, CheckCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (queueEntryId: number) => void;
  game: string;
}

interface GameMode {
  id: string;
  name: string;
  description: string;
  basePrice: number;
}

const GAME_MODES: Record<string, GameMode[]> = {
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
};

export default function BookingModal({ isOpen, onClose, onBookingComplete, game }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);
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
          onClose();
        }
      } else {
        setError(data.error || 'Failed to create booking');
      }
    } catch (error) {
      setError('Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedGameMode(null);
      setNumberOfMatches(1);
      setTeammatesNeeded(1);
      setSpecialRequests('');
      setDiscountCode('');
      setDiscountInfo(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl border-2 border-[#e6915b]/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e6915b]/20">
          <h2 className="text-2xl font-bold text-[#e6915b]">
            Book Your Gaming Session
          </h2>
          <button
            onClick={onClose}
            className="text-[#e6915b]/60 hover:text-[#e6915b] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Game Mode Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#e6915b] mb-4">
                  Select Game Mode
                </h3>
                <div className="grid gap-4">
                  {gameModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedGameMode(mode)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedGameMode?.id === mode.id
                          ? 'border-[#e6915b] bg-[#e6915b]/10'
                          : 'border-[#e6915b]/30 hover:border-[#e6915b]/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-[#e6915b]">{mode.name}</h4>
                        <span className="text-[#e6915b]/80 font-medium">
                          ${mode.basePrice}
                        </span>
                      </div>
                      <p className="text-[#e6915b]/60 text-sm">{mode.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedGameMode}
                  className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]"
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
                <h3 className="text-xl font-semibold text-[#e6915b] mb-4">
                  Session Details
                </h3>
                
                {/* Number of Matches */}
                <div className="mb-6">
                  <label className="block text-[#e6915b]/80 mb-2 font-medium">
                    Number of Matches
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setNumberOfMatches(Math.max(1, numberOfMatches - 1))}
                      className="w-10 h-10 rounded-lg bg-[#e6915b]/20 text-[#e6915b] hover:bg-[#e6915b]/30"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-[#e6915b] min-w-[3rem] text-center">
                      {numberOfMatches}
                    </span>
                    <button
                      onClick={() => setNumberOfMatches(Math.min(10, numberOfMatches + 1))}
                      className="w-10 h-10 rounded-lg bg-[#e6915b]/20 text-[#e6915b] hover:bg-[#e6915b]/30"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Teammates Needed */}
                <div className="mb-6">
                  <label className="block text-[#e6915b]/80 mb-2 font-medium">
                    Teammates Needed
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setTeammatesNeeded(Math.max(1, teammatesNeeded - 1))}
                      className="w-10 h-10 rounded-lg bg-[#e6915b]/20 text-[#e6915b] hover:bg-[#e6915b]/30"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-[#e6915b] min-w-[3rem] text-center">
                      {teammatesNeeded}
                    </span>
                    <button
                      onClick={() => setTeammatesNeeded(Math.min(5, teammatesNeeded + 1))}
                      className="w-10 h-10 rounded-lg bg-[#e6915b]/20 text-[#e6915b] hover:bg-[#e6915b]/30"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mb-6">
                  <label className="block text-[#e6915b]/80 mb-2 font-medium">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any specific requirements or preferences..."
                    className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-[#e6915b]/30 text-[#e6915b] placeholder-[#e6915b]/40 focus:border-[#e6915b] focus:outline-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b]/10"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a]"
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
                <h3 className="text-xl font-semibold text-[#e6915b] mb-4">
                  Payment & Discount
                </h3>

                {/* Order Summary */}
                <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-[#e6915b] mb-3">Order Summary</h4>
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
                  <label className="block text-[#e6915b]/80 mb-2 font-medium">
                    Discount Code (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Enter discount code..."
                      className="flex-1 p-3 rounded-lg bg-[#2a2a2a] border border-[#e6915b]/30 text-[#e6915b] placeholder-[#e6915b]/40 focus:border-[#e6915b] focus:outline-none"
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
                    <div className="flex items-center gap-2 mt-2 text-green-400">
                      <CheckCircle size={16} />
                      <span className="text-sm">
                        Discount applied: -${discountInfo.discountAmount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Final Price */}
                <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
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
                  className="border-[#e6915b]/30 text-[#e6915b] hover:bg-[#e6915b]/10"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateBooking}
                  disabled={isLoading}
                  className="bg-[#e6915b] hover:bg-[#e6915b]/80 text-[#1a1a1a] flex items-center gap-2"
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
    </div>
  );
} 