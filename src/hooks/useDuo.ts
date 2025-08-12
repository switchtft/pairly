// src/hooks/useDuo.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchGames,
  fetchPosts,
  fetchPost,
  createPost,
  updatePost,
  deletePost,
  fetchUserPost,
  saveDraft,
  updateDraft,
  type Game,
  type DuoPost,
  type PaginatedPosts,
  type UserPostData,
  type CreatePostData,
} from '@/lib/duo';

// Hook for managing games data
export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const gamesData = await fetchGames();
      setGames(gamesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return { games, loading, error, refetch: loadGames };
}

// Hook for managing posts with pagination
export function usePosts(gameId?: number) {
  const [posts, setPosts] = useState<DuoPost[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPosts({ gameId, page, limit: 20 });
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.pages) {
      loadPosts(pagination.page + 1);
    }
  }, [pagination.page, pagination.pages, loadPosts]);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  return {
    posts,
    pagination,
    loading,
    error,
    refetch: () => loadPosts(1),
    loadMore,
  };
}

// Hook for managing individual post
export function usePost(id: number) {
  const [post, setPost] = useState<DuoPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const postData = await fetchPost(id);
      setPost(postData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id, loadPost]);

  return { post, loading, error, refetch: loadPost };
}

// Hook for managing user's own post and draft
export function useUserPost() {
  const { user } = useAuth();
  const [userPostData, setUserPostData] = useState<UserPostData>({
    activePost: null,
    savedDraft: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserPost = useCallback(async () => {
    if (!user) {
      setUserPostData({ activePost: null, savedDraft: null });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserPost();
      setUserPostData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user post');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createUserPost = useCallback(async (data: CreatePostData) => {
    try {
      const newPost = await createPost(data);
      setUserPostData(prev => ({
        ...prev,
        activePost: newPost,
      }));
      return newPost;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateUserPost = useCallback(async (id: number, data: CreatePostData) => {
    try {
      const updatedPost = await updatePost(id, data);
      setUserPostData(prev => ({
        ...prev,
        activePost: updatedPost,
      }));
      return updatedPost;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteUserPost = useCallback(async (id: number) => {
    try {
      await deletePost(id);
      setUserPostData(prev => ({
        ...prev,
        activePost: null,
      }));
    } catch (err) {
      throw err;
    }
  }, []);

  const saveUserDraft = useCallback(async (data: CreatePostData) => {
    try {
      const draft = await saveDraft(data);
      setUserPostData(prev => ({
        ...prev,
        savedDraft: draft,
      }));
      return draft;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateUserDraft = useCallback(async (data: CreatePostData) => {
    try {
      const draft = await updateDraft(data);
      setUserPostData(prev => ({
        ...prev,
        savedDraft: draft,
      }));
      return draft;
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    loadUserPost();
  }, [loadUserPost]);

  return {
    userPostData,
    loading,
    error,
    refetch: loadUserPost,
    createPost: createUserPost,
    updatePost: updateUserPost,
    deletePost: deleteUserPost,
    saveDraft: saveUserDraft,
    updateDraft: updateUserDraft,
  };
}

// Hook for post actions (create, update, delete)
export function usePostActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPostAction = useCallback(async (data: CreatePostData) => {
    try {
      setLoading(true);
      setError(null);
      const post = await createPost(data);
      return post;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePostAction = useCallback(async (id: number, data: CreatePostData) => {
    try {
      setLoading(true);
      setError(null);
      const post = await updatePost(id, data);
      return post;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update post';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePostAction = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await deletePost(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete post';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createPost: createPostAction,
    updatePost: updatePostAction,
    deletePost: deletePostAction,
  };
}
