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
    'Jungler': '/images/roles/jungle.jpg', // Handle potential "Jungler" variant
    'Mid': '/images/roles/mid.jpg',
    'ADC': '/images/roles/adc.jpg',
    'Support': '/images/roles/support.jpg',
    'Fill': '/images/roles/fill.jpg',
    // Add lowercase variants in case the data comes in lowercase
    'top': '/images/roles/top.jpg',
    'jungle': '/images/roles/jungle.jpg',
    'jungler': '/images/roles/jungle.jpg',
    'mid': '/images/roles/mid.jpg',
    'adc': '/images/roles/adc.jpg',
    'support': '/images/roles/support.jpg',
    'fill': '/images/roles/fill.jpg'
  };

  return (
         <Card className={cn(
       "hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-[#1a1a1a] border-[#e6915b]/30 hover:border-[#e6915b]/50 h-[140px]",
       isOwnPost && "border-[#e6915b] bg-[#e6915b]/5"
     )}>
       <CardContent className="p-4 h-full">
         <div className="flex flex-col h-full">
                                 {/* Top section - User info and basic details */}
                                 <div className="grid items-center mb-3 grid-cols-[auto_1fr_auto] gap-4">
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
                   <div className="flex items-center gap-3 mb-1 flex-wrap">
                     <h3 className="font-semibold text-[#e6915b] whitespace-nowrap">
                       {post.author?.username || 'Unknown User'}
                     </h3>
                     <span className="text-sm text-gray-400">•</span>
                     <span className="text-sm font-medium text-[#e6915b] whitespace-nowrap">{post.rank}</span>
                     <span className="text-sm text-gray-400">•</span>
                     <span className="text-sm text-gray-400 whitespace-nowrap">{formatTimeAgo(post.createdAt)}</span>
                   </div>
                   
                   <div className="flex items-center gap-4 text-sm flex-wrap">
                     <span className="text-gray-400 whitespace-nowrap">In-game:</span>
                     <span className="font-medium text-[#e6915b] whitespace-nowrap">{post.inGameName}</span>
                     
                     <span className="text-gray-400 ml-4 whitespace-nowrap">Discord:</span>
                     <span className="font-mono text-[#e6915b] whitespace-nowrap">
                       {post.discord && post.discord.length > 10 
                         ? post.discord.substring(0, 10) + '...' 
                         : post.discord}
                     </span>
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

               {/* Roles, Champions, and Looking For - Centered */}
               <div className="flex items-center gap-4 justify-self-center">
                 {/* Roles You Play */}
                 <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-400">Plays</span>
                   <div className="flex gap-1">
                     {[...new Set(post.roles)].map((role) => {
                       const iconSrc = roleIcons[role as keyof typeof roleIcons];
                       return iconSrc ? (
                         <img 
                           key={role}
                           src={iconSrc} 
                           alt={role}
                           className="w-6 h-6 rounded-full object-cover"
                           onError={(e) => {
                             // Hide broken images
                             (e.target as HTMLImageElement).style.display = 'none';
                           }}
                         />
                       ) : (
                         <div key={role} className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs text-[#e6915b] font-medium">
                           {role.charAt(0).toUpperCase()}
                         </div>
                       );
                     })}
                   </div>
                 </div>

                 {/* Orange Divider */}
                 <div className="w-px h-6 bg-[#e6915b]/50"></div>

                 {/* Champions */}
                 <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-400">Champions</span>
                   <div className="flex gap-1">
                     {post.champions.slice(0, 3).map((champion) => (
                       <Badge key={champion} variant="secondary" className="text-xs px-1 py-0 bg-[#2a2a2a] text-[#e6915b] border border-[#e6915b]/30">
                         {champion}
                       </Badge>
                     ))}
                   </div>
                 </div>

                 {/* Orange Divider */}
                 <div className="w-px h-6 bg-[#e6915b]/50"></div>

                 {/* Looking For */}
                 <div className="flex items-center gap-2">
                   <span className="text-xs text-gray-400">Looking for</span>
                   <div className="flex gap-1">
                     {[...new Set(post.lookingFor)].map((role) => {
                       const iconSrc = roleIcons[role as keyof typeof roleIcons];
                       return iconSrc ? (
                         <img 
                           key={role}
                           src={iconSrc} 
                           alt={role}
                           className="w-6 h-6 rounded-full object-cover"
                           onError={(e) => {
                             // Hide broken images
                             (e.target as HTMLImageElement).style.display = 'none';
                           }}
                         />
                       ) : (
                         <div key={role} className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs text-[#e6915b] font-medium">
                           {role.charAt(0).toUpperCase()}
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>

                               {/* Actions */}
                <div className="flex flex-col gap-1 justify-self-start items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewDetails}
                    className="flex-shrink-0 bg-[#e6915b] text-white border-[#e6915b] hover:bg-[#e6915b]/90 hover:text-white w-16"
                  >
                    View
                  </Button>

                  {(isOwnPost || isAdmin) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="w-16"
                    >
                      Delete
                    </Button>
                  )}
                </div>
             </div>

                          {/* Bottom section - Message */}
             {post.message && (
               <div className="mt-auto">
                 <div className="text-xs text-gray-300 bg-[#2a2a2a] p-2 rounded-md max-w-full overflow-hidden">
                   <div className="truncate">
                     <span className="text-gray-400">Message: </span>
                     {post.message}
                   </div>
                 </div>
               </div>
             )}
        </div>
      </CardContent>
    </Card>
  );
}
