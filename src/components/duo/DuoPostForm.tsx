'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema, type CreatePostData, type Game } from '@/lib/duo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DuoPostFormProps {
  games: Game[];
  initialData?: CreatePostData;
  onSubmit: (data: CreatePostData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  selectedGameId?: number;
}

export function DuoPostForm({
  games,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  selectedGameId
}: DuoPostFormProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(
    initialData ? games.find(g => g.id === initialData.gameId) || null : 
    selectedGameId ? games.find(g => g.id === selectedGameId) || null : null
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<CreatePostData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: initialData || {
      gameId: selectedGameId || 0,
      inGameName: '',
      rank: '',
      roles: [],
      lookingFor: [],
      champions: [],
      message: '',
      discord: '',
      showDiscord: true,
    },
    mode: 'onChange'
  });

  const watchedRoles = watch('roles');
  const watchedLookingFor = watch('lookingFor');
  const watchedChampions = watch('champions');
  const watchedGameId = watch('gameId');
  const watchedInGameName = watch('inGameName');
  const watchedRank = watch('rank');
  const watchedMessage = watch('message');
  const watchedDiscord = watch('discord');

  // Update selected game when gameId changes
  useEffect(() => {
    const game = games.find(g => g.id === watchedGameId);
    setSelectedGame(game || null);
  }, [watchedGameId, games]);

  // Load initial form data for the current game when component mounts
  useEffect(() => {
    if (selectedGame && mode === 'create' && !initialData) {
      const savedFormData = localStorage.getItem(`duo-form-draft-${selectedGame.slug}`);
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          // Only load if the saved data is for the current game
          if (parsedData.gameId === selectedGame.id) {
            reset({
              ...parsedData,
              gameId: selectedGame.id, // Ensure we use the correct gameId
            });
          }
        } catch (error) {
          console.error('Failed to parse saved form data:', error);
        }
      }
    }
  }, [selectedGame, mode, initialData, reset]);

  // Set gameId when selectedGameId prop changes
  useEffect(() => {
    if (selectedGameId && selectedGameId !== watchedGameId) {
      // Save current form data before switching games
      if (selectedGame) {
        const currentFormData = {
          gameId: watchedGameId,
          inGameName: watchedInGameName,
          rank: watchedRank,
          roles: watchedRoles,
          lookingFor: watchedLookingFor,
          champions: watchedChampions,
          message: watchedMessage,
          discord: watchedDiscord,
          showDiscord: true,
        };
        localStorage.setItem(`duo-form-draft-${selectedGame.slug}`, JSON.stringify(currentFormData));
      }

      // Load form data for the new game
      const newGame = games.find(g => g.id === selectedGameId);
      if (newGame) {
        const savedFormData = localStorage.getItem(`duo-form-draft-${newGame.slug}`);
        if (savedFormData) {
          try {
            const parsedData = JSON.parse(savedFormData);
            // Only load form data if it's for the same game
            if (parsedData.gameId === selectedGameId) {
              reset({
                ...parsedData,
                gameId: selectedGameId, // Ensure we use the correct gameId
              });
            } else {
              // Reset to default values for new game
              reset({
                gameId: selectedGameId,
                inGameName: '',
                rank: '',
                roles: [],
                lookingFor: [],
                champions: [],
                message: '',
                discord: '',
                showDiscord: true,
              });
            }
          } catch (error) {
            console.error('Failed to parse saved form data:', error);
            // Reset to default values on error
            reset({
              gameId: selectedGameId,
              inGameName: '',
              rank: '',
              roles: [],
              lookingFor: [],
              champions: [],
              message: '',
              discord: '',
              showDiscord: true,
            });
          }
        } else {
          // Reset to default values for new game
          reset({
            gameId: selectedGameId,
            inGameName: '',
            rank: '',
            roles: [],
            lookingFor: [],
            champions: [],
            message: '',
            discord: '',
            showDiscord: true,
          });
        }
      }

      setValue('gameId', selectedGameId);
      setSelectedGame(newGame || null);
    }
  }, [selectedGameId, setValue, watchedGameId, games, selectedGame, watchedInGameName, watchedRank, watchedRoles, watchedLookingFor, watchedChampions, watchedMessage, watchedDiscord, reset]);

  // Auto-save form data as user types
  useEffect(() => {
    if (selectedGame && mode === 'create') {
      const formData = {
        gameId: watchedGameId,
        inGameName: watchedInGameName,
        rank: watchedRank,
        roles: watchedRoles,
        lookingFor: watchedLookingFor,
        champions: watchedChampions,
        message: watchedMessage,
        discord: watchedDiscord,
        showDiscord: true,
      };
      localStorage.setItem(`duo-form-draft-${selectedGame.slug}`, JSON.stringify(formData));
    }
  }, [selectedGame, mode, watchedGameId, watchedInGameName, watchedRank, watchedRoles, watchedLookingFor, watchedChampions, watchedMessage, watchedDiscord]);

  const toggleRole = (role: string, field: 'roles' | 'lookingFor') => {
    const currentValues = watch(field);
    const newValues = currentValues.includes(role)
      ? currentValues.filter(r => r !== role)
      : currentValues.length < 2 
        ? [...currentValues, role]
        : currentValues; // Don't add if already at max
    setValue(field, newValues);
  };

  const addChampion = (champion: string) => {
    const currentChampions = watch('champions');
    if (currentChampions.length < 3 && !currentChampions.includes(champion)) {
      setValue('champions', [...currentChampions, champion]);
    }
  };

  const removeChampion = (champion: string) => {
    const currentChampions = watch('champions');
    setValue('champions', currentChampions.filter(c => c !== champion));
  };

  const handleFormSubmit = async (data: CreatePostData) => {
    try {
      await onSubmit(data);
      if (mode === 'create') {
        // Clear the form draft for this game after successful submission
        if (selectedGame) {
          localStorage.removeItem(`duo-form-draft-${selectedGame.slug}`);
        }
        
        // Reset form but keep the selected game
        reset({
          gameId: selectedGameId || 0,
          inGameName: '',
          rank: '',
          roles: [],
          lookingFor: [],
          champions: [],
          message: '',
          discord: '',
          showDiscord: true,
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Role icons mapping - using the correct icons for each game
  const roleIcons = {
    // League of Legends roles
    'Top': '/images/roles/top.jpg',
    'Jungle': '/images/roles/jungle.jpg',
    'Mid': '/images/roles/mid.jpg',
    'ADC': '/images/roles/adc.jpg',
    'Support': '/images/roles/support.jpg',
    'Fill': '/images/roles/fill.jpg',
    // Valorant roles
    'Duelist': '/images/roles/duelist.png',
    'Initiator': '/images/roles/initiator.png',
    'Controller': '/images/roles/controller.png',
    'Sentinel': '/images/roles/sentinel.png'
  };

  // Define the order of roles for each game
  const getRoleOrder = (gameSlug: string) => {
    switch (gameSlug) {
      case 'valorant':
        return ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
      case 'league-of-legends':
      default:
        return ['Top', 'Jungle', 'Mid', 'ADC', 'Support', 'Fill'];
    }
  };

  const roleOrder = getRoleOrder(selectedGame?.slug || 'league-of-legends');

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* LINE 1: In-game Name | Rank | Discord Username */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inGameName" className="text-[#e6915b] text-sm">In-game Name *</Label>
            <Input
              id="inGameName"
              {...register('inGameName')}
              placeholder="Username#Tag"
              className="bg-[#2a2a2a] border-[#e6915b]/30 text-[#e6915b] placeholder:text-gray-400 h-9 focus:border-[#e6915b] focus:ring-[#e6915b]/20"
            />
            {errors.inGameName && (
              <p className="text-sm text-red-400">{errors.inGameName.message}</p>
            )}
          </div>

          {selectedGame && (
            <div className="space-y-2">
              <Label htmlFor="rank" className="text-[#e6915b] text-sm">Rank *</Label>
              <Select
                value={watch('rank')}
                onValueChange={(value) => setValue('rank', value)}
              >
                <SelectTrigger className="bg-[#2a2a2a] border-[#e6915b]/30 text-[#e6915b] h-9 focus:border-[#e6915b] focus:ring-[#e6915b]/20">
                  <SelectValue placeholder="Select your rank" />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2a] border-[#e6915b]/30">
                  {selectedGame.ranks.map((rank) => (
                    <SelectItem key={rank} value={rank} className="text-[#e6915b] hover:bg-[#1a1a1a]">
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rank && (
                <p className="text-sm text-red-400">{errors.rank.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="discord" className="text-[#e6915b] text-sm">Discord Username *</Label>
            <Input
              id="discord"
              {...register('discord')}
              placeholder="username"
              className="bg-[#2a2a2a] border-[#e6915b]/30 text-[#e6915b] placeholder:text-gray-400 h-9 focus:border-[#e6915b] focus:ring-[#e6915b]/20"
            />
            {errors.discord && (
              <p className="text-sm text-red-400">{errors.discord.message}</p>
            )}
          </div>
        </div>

        {/* LINE 2: Roles you play | Main Champions | Roles looking for */}
        {selectedGame && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Roles You Play */}
            <div className="space-y-2">
              <Label className="text-[#e6915b] text-sm">Roles You Play *</Label>
              <div className="flex flex-wrap gap-2">
                {roleOrder.map((role) => {
                  const isSelected = watchedRoles.includes(role);
                  const isDisabled = !isSelected && watchedRoles.length >= 2;
                  
                  return (
                    <div
                      key={role}
                      className={cn(
                        'transition-all duration-200 p-2 rounded-lg',
                        isSelected
                          ? 'cursor-pointer bg-[#e6915b]/20 border border-[#e6915b]' 
                          : isDisabled
                            ? 'cursor-not-allowed bg-[#1a1a1a] border border-[#333] opacity-50'
                            : 'cursor-pointer bg-[#2a2a2a] border border-[#e6915b]/20 hover:bg-[#e6915b]/10'
                      )}
                      onClick={() => !isDisabled && toggleRole(role, 'roles')}
                    >
                      <img 
                        src={roleIcons[role as keyof typeof roleIcons]} 
                        alt={role}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
              {errors.roles && (
                <p className="text-sm text-red-400">{errors.roles.message}</p>
              )}
            </div>

            {/* Champions/Agents Dropdown */}
            <div className="space-y-2">
              <Label className="text-[#e6915b] text-sm">
                {selectedGame?.slug === 'valorant' ? 'Main Agents' : 'Main Champions'} (Max 3) *
              </Label>
              <Select
                value=""
                onValueChange={(value) => addChampion(value)}
              >
                <SelectTrigger className="bg-[#2a2a2a] border-[#e6915b]/30 text-[#e6915b] h-9 focus:border-[#e6915b] focus:ring-[#e6915b]/20">
                  <SelectValue placeholder={selectedGame?.slug === 'valorant' ? 'Add an agent' : 'Add a champion'} />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2a] border-[#e6915b]/30">
                  {selectedGame.champions.map((champion) => (
                    <SelectItem 
                      key={champion.id} 
                      value={champion.name} 
                      className="text-[#e6915b] hover:bg-[#1a1a1a]"
                      disabled={watchedChampions.includes(champion.name) || watchedChampions.length >= 3}
                    >
                      {champion.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {watchedChampions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {watchedChampions.map((champion) => (
                    <Badge key={champion} variant="secondary" className="flex items-center gap-1 text-xs px-2 py-1 bg-[#2a2a2a] text-[#e6915b] border border-[#e6915b]/30">
                      {champion}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-400"
                        onClick={() => removeChampion(champion)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              {errors.champions && (
                <p className="text-sm text-red-400">{errors.champions.message}</p>
              )}
            </div>

            {/* Looking For */}
            <div className="space-y-2">
              <Label className="text-[#e6915b] text-sm">Looking For *</Label>
              <div className="flex flex-wrap gap-2">
                {roleOrder.map((role) => {
                  const isSelected = watchedLookingFor.includes(role);
                  const isDisabled = !isSelected && watchedLookingFor.length >= 2;
                  
                  return (
                    <div
                      key={role}
                      className={cn(
                        'transition-all duration-200 p-2 rounded-lg',
                        isSelected
                          ? 'cursor-pointer bg-[#e6915b]/20 border border-[#e6915b]' 
                          : isDisabled
                            ? 'cursor-not-allowed bg-[#1a1a1a] border border-[#333] opacity-50'
                            : 'cursor-pointer bg-[#2a2a2a] border border-[#e6915b]/20 hover:bg-[#e6915b]/10'
                      )}
                      onClick={() => !isDisabled && toggleRole(role, 'lookingFor')}
                    >
                      <img 
                        src={roleIcons[role as keyof typeof roleIcons]} 
                        alt={role}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
              {errors.lookingFor && (
                <p className="text-sm text-red-400">{errors.lookingFor.message}</p>
              )}
            </div>
          </div>
        )}

        {/* LINE 3: Message | Create Post Button */}
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="message" className="text-[#e6915b] text-sm">Message (Optional)</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Tell potential duo partners about yourself..."
              rows={1}
              className="bg-[#2a2a2a] border-[#e6915b]/30 text-[#e6915b] placeholder:text-gray-400 resize-none focus:border-[#e6915b] focus:ring-[#e6915b]/20"
            />
            {errors.message && (
              <p className="text-sm text-red-400">{errors.message.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="bg-[#e6915b] hover:bg-[#d8824a] text-white h-9 px-6"
          >
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Update Post'}
          </Button>
        </div>

        {/* Cancel button for edit mode */}
        {onCancel && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="border-[#e6915b] text-[#e6915b] hover:bg-[#e6915b] hover:text-white"
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
