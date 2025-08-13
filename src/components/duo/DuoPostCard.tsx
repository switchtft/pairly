'use client';

import React from 'react';
import { DuoPost } from '@/lib/duo';
import { formatTimeAgo, copyToClipboard } from '@/lib/duo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, Eye, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DuoPostCardProps {
  post: DuoPost;
  onViewDetails?: (post: DuoPost) => void;
  onDelete?: (postId: number) => void;
  isOwnPost?: boolean;
  isAdmin?: boolean;
}

export function DuoPostCard({ 
  post, 
  onViewDetails, 
  onDelete, 
  isOwnPost = false,
  isAdmin = false 
}: DuoPostCardProps) {
  const handleCopyDiscord = async () => {
    if (post.discord) {
      try {
        await copyToClipboard(post.discord);
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy Discord tag:', error);
      }
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(post);
    }
  };

  const handleDelete = () => {
    if (onDelete && (isOwnPost || isAdmin)) {
      onDelete(post.id);
    }
  };

  // Role icons mapping
  const roleIcons = {
    'Top': '/images/roles/top.jpg',
    'Jungle': '/images/roles/jungle.jpg',
    'Mid': '/images/roles/mid.jpg',
    'ADC': '/images/roles/adc.jpg',
    'Support': '/images/roles/support.jpg',
    'Fill': '/images/roles/fill.jpg'
  };

  return (
    <Card className={cn(
      "hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-[#1a1a1a] border-[#e6915b]/30 hover:border-[#e6915b]/50 h-[120px]",
      isOwnPost && "border-[#e6915b] bg-[#e6915b]/5"
    )}>
      <CardContent className="p-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left side - User info and basic details */}
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-12 w-12">
              {post.author?.avatar && (
                <AvatarImage src={post.author.avatar} alt={post.author?.username} />
              )}
              <AvatarFallback className="bg-[#2a2a2a] text-[#e6915b]">
                {post.author?.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-[#e6915b]">
                  {post.author?.username || 'Unknown User'}
                </h3>
                {isOwnPost && (
                  <Badge variant="secondary" className="text-xs bg-[#e6915b] text-white">
                    Your Post
                  </Badge>
                )}
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-400">{post.game.name}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm font-medium text-[#e6915b]">{post.rank}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-400">{formatTimeAgo(post.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">In-game:</span>
                <span className="font-medium text-[#e6915b]">{post.inGameName}</span>
                
                <span className="text-gray-400 ml-4">Discord:</span>
                <span className="font-mono text-[#e6915b]">{post.discord}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyDiscord}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-[#e6915b] hover:bg-[#2a2a2a]"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Center - Role icons */}
          <div className="flex items-center gap-6">
            {/* Roles You Play */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">Plays</span>
              <div className="flex gap-1">
                {post.roles.map((role) => (
                  <img 
                    key={role}
                    src={roleIcons[role as keyof typeof roleIcons]} 
                    alt={role}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ))}
              </div>
            </div>

            {/* Champions */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">Champions</span>
              <div className="flex gap-1">
                {post.champions.slice(0, 3).map((champion) => (
                  <Badge key={champion} variant="secondary" className="text-xs px-1 py-0 bg-[#2a2a2a] text-[#e6915b] border border-[#e6915b]/30">
                    {champion}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Looking For */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">Looking for</span>
              <div className="flex gap-1">
                {post.lookingFor.map((role) => (
                  <img 
                    key={role}
                    src={roleIcons[role as keyof typeof roleIcons]} 
                    alt={role}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Actions and message preview */}
          <div className="flex items-center gap-3">
            {/* Message preview */}
            {post.message && (
              <div className="max-w-[200px] text-xs text-gray-300 bg-[#2a2a2a] p-2 rounded-md">
                &ldquo;{post.message.length > 50 ? post.message.substring(0, 50) + '...' : post.message}&rdquo;
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Eye className="h-3 w-3" />
                <span>{post.views}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="flex items-center gap-1 border-[#e6915b] text-[#e6915b] hover:bg-[#e6915b] hover:text-white"
              >
                <MessageCircle className="h-3 w-3" />
                View
              </Button>

              {(isOwnPost || isAdmin) && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="text-xs"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
