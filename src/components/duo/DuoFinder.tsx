'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGames, usePosts, useUserPost, usePostActions } from '@/hooks/useDuo';
import { DuoPostCard } from './DuoPostCard';
import { DuoPostForm } from './DuoPostForm';
import { DuoPostModal } from './DuoPostModal';
import { GameSelector } from './GameSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Save, X } from 'lucide-react';
import { DuoPost, CreatePostData } from '@/lib/duo';

export function DuoFinder() {
  const { user } = useAuth();
  const { games, isLoading: gamesLoading } = useGames();
  const [selectedGameId, setSelectedGameId] = useState<number>(1); // Default to League of Legends
  const { posts, isLoading: postsLoading, refetch: refetchPosts } = usePosts(selectedGameId);
  const { userPost, isLoading: userPostLoading } = useUserPost();
  const { createPost, updatePost, deletePost, saveDraft, updateDraft } = usePostActions();

  // UI State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<DuoPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default game to League of Legends when games load
  useEffect(() => {
    if (games.length > 0 && selectedGameId === 1) {
      const leagueGame = games.find(g => g.slug === 'league-of-legends');
      if (leagueGame) {
        setSelectedGameId(leagueGame.id);
      }
    }
  }, [games, selectedGameId]);

  const handleGameSelect = (gameId: number) => {
    setSelectedGameId(gameId);
  };

  const handleCreatePost = async (data: CreatePostData) => {
    setIsSubmitting(true);
    try {
      await createPost(data);
      setShowCreateForm(false);
      refetchPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (data: CreatePostData) => {
    setIsSubmitting(true);
    try {
      if (userPost?.savedDraft) {
        await updateDraft(data);
      } else {
        await saveDraft(data);
      }
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDraft = () => {
    if (userPost?.savedDraft) {
      setShowEditForm(true);
    }
  };

  const handleUpdateDraft = async (data: CreatePostData) => {
    setIsSubmitting(true);
    try {
      await updateDraft(data);
      setShowEditForm(false);
    } catch (error) {
      console.error('Failed to update draft:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPost = (post: DuoPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId);
      refetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const isOwnPost = (post: DuoPost) => post.author.id === user?.id;
  const isAdmin = user?.role === 'administrator';

  if (gamesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Duo Finder</h1>
        <p className="text-muted-foreground">
          Find duo partners for free! Create a post or browse existing ones to connect with other players.
        </p>
      </div>

      {/* Game Selector */}
      <GameSelector
        games={games}
        selectedGameId={selectedGameId}
        onGameSelect={handleGameSelect}
        showPostCounts={true}
        isAdmin={isAdmin}
      />

      {/* User's Active Post */}
      {userPost?.activePost && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Active Post</CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeletePost(userPost.activePost!.id)}
              >
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DuoPostCard
              post={userPost.activePost}
              onViewDetails={handleViewPost}
              onDelete={handleDeletePost}
              isOwnPost={true}
            />
          </CardContent>
        </Card>
      )}

      {/* User's Saved Draft */}
      {userPost?.savedDraft && !userPost?.activePost && (
        <Card className="mb-6 border-secondary/20 bg-secondary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Saved Draft</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditDraft}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleCreatePost({
                    gameId: userPost.savedDraft.gameId,
                    inGameName: userPost.savedDraft.inGameName,
                    rank: userPost.savedDraft.rank,
                    roles: userPost.savedDraft.roles,
                    lookingFor: userPost.savedDraft.lookingFor,
                    champions: userPost.savedDraft.champions,
                    message: userPost.savedDraft.message,
                    discord: userPost.savedDraft.discord,
                    showDiscord: userPost.savedDraft.showDiscord,
                  })}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Post Now
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DuoPostCard
              post={userPost.savedDraft}
              isOwnPost={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Create Post Button */}
      {!userPost?.activePost && (
        <div className="mb-6">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {userPost?.savedDraft ? 'Create New Post' : 'Create Post'}
          </Button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {showEditForm ? 'Edit Draft' : 'Create Duo Post'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <DuoPostForm
                games={games}
                initialData={showEditForm ? {
                  gameId: userPost?.savedDraft?.gameId || 0,
                  inGameName: userPost?.savedDraft?.inGameName || '',
                  rank: userPost?.savedDraft?.rank || '',
                  roles: userPost?.savedDraft?.roles || [],
                  lookingFor: userPost?.savedDraft?.lookingFor || [],
                  champions: userPost?.savedDraft?.champions || [],
                  message: userPost?.savedDraft?.message || '',
                  discord: userPost?.savedDraft?.discord || '',
                  showDiscord: userPost?.savedDraft?.showDiscord ?? true,
                } : undefined}
                onSubmit={showEditForm ? handleUpdateDraft : handleCreatePost}
                onCancel={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                }}
                isLoading={isSubmitting}
                mode={showEditForm ? 'edit' : 'create'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Available Posts
            {postsLoading && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Loading...)
              </span>
            )}
          </h2>
          {posts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {postsLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading posts...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center mb-4">
                No posts found for this game.
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Be the first to post!
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <DuoPostCard
                key={post.id}
                post={post}
                onViewDetails={handleViewPost}
                onDelete={handleDeletePost}
                isOwnPost={isOwnPost(post)}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      <DuoPostModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPost(null);
        }}
        onDelete={handleDeletePost}
        isOwnPost={selectedPost ? isOwnPost(selectedPost) : false}
        isAdmin={isAdmin}
      />
    </div>
  );
}
