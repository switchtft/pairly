'use client';

import React from 'react';
import { DuoPost } from '@/lib/duo';
import { formatTimeAgo, copyToClipboard } from '@/lib/duo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, X, MessageCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DuoPostModalProps {
  post: DuoPost | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (postId: number) => void;
  isOwnPost?: boolean;
  isAdmin?: boolean;
}

export function DuoPostModal({
  post,
  isOpen,
  onClose,
  onDelete,
  isOwnPost = false,
  isAdmin = false
}: DuoPostModalProps) {
  const handleCopyDiscord = async () => {
    if (post?.discord) {
      try {
        await copyToClipboard(post.discord);
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy Discord tag:', error);
      }
    }
  };

  const handleDelete = () => {
    if (onDelete && post && (isOwnPost || isAdmin)) {
      onDelete(post.id);
      onClose();
    }
  };

  if (!isOpen || !post) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar} alt={post.author.username} />
                <AvatarFallback>
                  {post.author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{post.author.username}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{post.game.name}</span>
                  <span>•</span>
                  <span className="font-medium">{post.rank}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{post.views}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* In-game Name */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                In-game Name
              </h3>
              <p className="text-lg font-medium">{post.inGameName}</p>
            </div>

            {/* Roles */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                Roles You Play
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.roles.map((role) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Champions */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                Main Champions
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.champions.map((champion) => (
                  <Badge key={champion} variant="secondary">
                    {champion}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Looking For */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                Looking For
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.lookingFor.map((role) => (
                  <Badge key={role} variant="default">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Message */}
            {post.message && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Message
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">"{post.message}"</p>
                </div>
              </div>
            )}

            {/* Discord */}
            {post.discord && post.showDiscord && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Discord
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg">{post.discord}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyDiscord}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  // You could implement a messaging system here
                  console.log('Message user:', post.author.username);
                }}
              >
                <MessageCircle className="h-4 w-4" />
                Message User
              </Button>

              {(isOwnPost || isAdmin) && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="ml-auto"
                >
                  Delete Post
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
