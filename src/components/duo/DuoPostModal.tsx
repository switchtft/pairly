'use client';

import React from 'react';
import { DuoPost } from '@/lib/duo';
import { formatTimeAgo, copyToClipboard } from '@/lib/duo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, X, MessageCircle, Eye } from 'lucide-react';


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
      <div className="bg-[#1a1a1a] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e6915b]/30">
        <Card className="bg-[#1a1a1a] border-none">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {post.author?.avatar && (
                  <AvatarImage src={post.author.avatar} alt={post.author.username} />
                )}
                <AvatarFallback className="bg-[#2a2a2a] text-[#e6915b]">
                  {post.author?.username?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg text-[#e6915b]">{post.author?.username || 'Unknown User'}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{post.game.name}</span>
                  <span>•</span>
                  <span className="font-medium">{post.rank}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-[#e6915b] hover:bg-[#2a2a2a]"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* In-game Name */}
            <div>
              <h3 className="font-semibold text-sm text-gray-400 mb-1">
                In-game Name
              </h3>
              <p className="text-lg font-medium text-[#e6915b]">{post.inGameName}</p>
            </div>

            {/* Roles */}
            <div>
              <h3 className="font-semibold text-sm text-gray-400 mb-2">
                Roles You Play
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.roles.map((role) => (
                  <Badge key={role} variant="outline" className="border-[#e6915b] text-[#e6915b]">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Champions */}
            <div>
              <h3 className="font-semibold text-sm text-gray-400 mb-2">
                Main Champions
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.champions.map((champion) => (
                  <Badge key={champion} variant="secondary" className="bg-[#2a2a2a] text-[#e6915b] border border-[#e6915b]/30">
                    {champion}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Looking For */}
            <div>
              <h3 className="font-semibold text-sm text-gray-400 mb-2">
                Looking For
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.lookingFor.map((role) => (
                  <Badge key={role} variant="default" className="bg-[#e6915b] text-white">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Message */}
            {post.message && (
              <div>
                <h3 className="font-semibold text-sm text-gray-400 mb-2">
                  Message
                </h3>
                                 <div className="bg-[#2a2a2a] p-4 rounded-lg">
                   <p className="text-sm leading-relaxed text-gray-300">{post.message}</p>
                 </div>
              </div>
            )}

            {/* Discord */}
            {post.discord && post.showDiscord && (
              <div>
                <h3 className="font-semibold text-sm text-gray-400 mb-2">
                  Discord
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg text-[#e6915b]">{post.discord}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyDiscord}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-[#e6915b] hover:bg-[#2a2a2a]"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#e6915b]/30">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-[#e6915b] text-white border-[#e6915b] hover:bg-[#e6915b]/90 hover:text-white"
                onClick={() => {
                  // You could implement a messaging system here
                  console.log('Message user:', post.author?.username);
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
