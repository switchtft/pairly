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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DuoPostFormProps {
  games: Game[];
  initialData?: CreatePostData;
  onSubmit: (data: CreatePostData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export function DuoPostForm({
  games,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create'
}: DuoPostFormProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(
    initialData ? games.find(g => g.id === initialData.gameId) || null : null
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
      gameId: 0,
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

  // Update selected game when gameId changes
  useEffect(() => {
    const game = games.find(g => g.id === watchedGameId);
    setSelectedGame(game || null);
  }, [watchedGameId, games]);

  const handleGameChange = (gameId: string) => {
    const game = games.find(g => g.id === parseInt(gameId));
    setSelectedGame(game || null);
    setValue('gameId', parseInt(gameId));
    // Reset game-specific fields when game changes
    setValue('roles', []);
    setValue('lookingFor', []);
    setValue('champions', []);
    setValue('rank', '');
  };

  const toggleRole = (role: string, field: 'roles' | 'lookingFor') => {
    const currentValues = watch(field);
    const newValues = currentValues.includes(role)
      ? currentValues.filter(r => r !== role)
      : [...currentValues, role];
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
        reset();
        setSelectedGame(null);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create Duo Post' : 'Edit Duo Post'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Game Selection */}
          <div className="space-y-2">
            <Label htmlFor="game">Game *</Label>
            <Select
              value={watchedGameId.toString()}
              onValueChange={handleGameChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {games.map((game) => (
                  <SelectItem key={game.id} value={game.id.toString()}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gameId && (
              <p className="text-sm text-destructive">{errors.gameId.message}</p>
            )}
          </div>

          {/* In-game Name */}
          <div className="space-y-2">
            <Label htmlFor="inGameName">In-game Name *</Label>
            <Input
              id="inGameName"
              {...register('inGameName')}
              placeholder="Your in-game username"
            />
            {errors.inGameName && (
              <p className="text-sm text-destructive">{errors.inGameName.message}</p>
            )}
          </div>

          {/* Rank */}
          {selectedGame && (
            <div className="space-y-2">
              <Label htmlFor="rank">Rank *</Label>
              <Select
                value={watch('rank')}
                onValueChange={(value) => setValue('rank', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your rank" />
                </SelectTrigger>
                <SelectContent>
                  {selectedGame.ranks.map((rank) => (
                    <SelectItem key={rank} value={rank}>
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rank && (
                <p className="text-sm text-destructive">{errors.rank.message}</p>
              )}
            </div>
          )}

          {/* Roles */}
          {selectedGame && (
            <div className="space-y-2">
              <Label>Roles You Play *</Label>
              <div className="flex flex-wrap gap-2">
                {selectedGame.roles.map((role) => (
                  <Badge
                    key={role}
                    variant={watchedRoles.includes(role) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      watchedRoles.includes(role) && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => toggleRole(role, 'roles')}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
              {errors.roles && (
                <p className="text-sm text-destructive">{errors.roles.message}</p>
              )}
            </div>
          )}

          {/* Looking For */}
          {selectedGame && (
            <div className="space-y-2">
              <Label>Looking For *</Label>
              <div className="flex flex-wrap gap-2">
                {selectedGame.roles.map((role) => (
                  <Badge
                    key={role}
                    variant={watchedLookingFor.includes(role) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      watchedLookingFor.includes(role) && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => toggleRole(role, 'lookingFor')}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
              {errors.lookingFor && (
                <p className="text-sm text-destructive">{errors.lookingFor.message}</p>
              )}
            </div>
          )}

          {/* Champions */}
          {selectedGame && (
            <div className="space-y-2">
              <Label>Main Champions (Max 3) *</Label>
              <div className="flex flex-wrap gap-2">
                {selectedGame.champions.map((champion) => (
                  <Badge
                    key={champion.id}
                    variant={watchedChampions.includes(champion.name) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      watchedChampions.includes(champion.name) && 'bg-primary text-primary-foreground',
                      watchedChampions.length >= 3 && !watchedChampions.includes(champion.name) && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => addChampion(champion.name)}
                  >
                    {champion.name}
                  </Badge>
                ))}
              </div>
              {watchedChampions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {watchedChampions.map((champion) => (
                    <Badge key={champion} variant="secondary" className="flex items-center gap-1">
                      {champion}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeChampion(champion)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              {errors.champions && (
                <p className="text-sm text-destructive">{errors.champions.message}</p>
              )}
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Tell potential duo partners about yourself..."
              rows={3}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Discord */}
          <div className="space-y-2">
            <Label htmlFor="discord">Discord Tag (Optional)</Label>
            <Input
              id="discord"
              {...register('discord')}
              placeholder="username#0000"
            />
            {errors.discord && (
              <p className="text-sm text-destructive">{errors.discord.message}</p>
            )}
          </div>

          {/* Show Discord */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showDiscord"
              checked={watch('showDiscord')}
              onCheckedChange={(checked) => setValue('showDiscord', checked as boolean)}
            />
            <Label htmlFor="showDiscord">Show Discord tag on my post</Label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Update Post'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
