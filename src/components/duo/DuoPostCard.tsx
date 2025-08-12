'use client';

import React from 'react';
import { DuoPost } from '@/lib/duo';
import { formatTimeAgo, copyToClipboard } from '@/lib/duo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, Eye, MessageCircle } from 'lucide-react';


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

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.username} />
              <AvatarFallback>
                {post.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">
                  {post.author.username}
                </h3>
                {isOwnPost && (
                  <Badge variant="secondary" className="text-xs">
                    Your Post
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{post.game.name}</span>
                <span>•</span>
                <span className="font-medium">{post.rank}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{post.views}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* In-game name */}
          <div>
            <span className="text-xs text-muted-foreground">In-game:</span>
            <span className="ml-2 font-medium">{post.inGameName}</span>
          </div>

          {/* Roles and Champions */}
          <div className="space-y-2">
            <div>
              <span className="text-xs text-muted-foreground">Plays:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {post.roles.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-xs text-muted-foreground">Champions:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {post.champions.map((champion) => (
                  <Badge key={champion} variant="secondary" className="text-xs">
                    {champion}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Looking for */}
          <div>
            <span className="text-xs text-muted-foreground">Looking for:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {post.lookingFor.map((role) => (
                <Badge key={role} variant="default" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </div>

                     {/* Message */}
           {post.message && (
             <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
               &ldquo;{post.message}&rdquo;
             </div>
           )}

          {/* Discord */}
          {post.discord && post.showDiscord && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Discord:</span>
              <span className="text-sm font-mono">{post.discord}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyDiscord}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex items-center gap-1"
            >
              <MessageCircle className="h-3 w-3" />
              View Details
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
      </CardContent>
    </Card>
  );
}
