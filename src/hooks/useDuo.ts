import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
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
  type CreatePostData,
  type UserPostData,
} from '@/lib/duo';

// Query keys for consistency and easy cache management
const queryKeys = {
  games: ['games'] as const,
  posts: (filters: { gameId?: number }) => ['posts', filters] as const,
  post: (id: number) => ['post', id] as const,
  userPost: ['userPost'] as const,
};

/**
 * Hook to fetch the list of games.
 * Calls the `fetchGames` function from `duo.ts`.
 */
export function useGames() {
  return useQuery<Game[], Error>({
    queryKey: queryKeys.games,
    queryFn: fetchGames,
    staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
  });
}

/**
 * Hook to fetch posts with infinite scrolling (pagination).
 * Calls the `fetchPosts` function from `duo.ts` for each page.
 */
export function usePosts(gameId?: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts({ gameId }),
    queryFn: ({ pageParam = 1 }) => fetchPosts({ gameId, page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined; // No more pages
    },
  });
}

/**
 * Hook to fetch a single post.
 * Calls the `fetchPost` function from `duo.ts`.
 */
export function usePost(id?: number) {
  return useQuery<DuoPost, Error>({
    queryKey: queryKeys.post(id!),
    queryFn: () => fetchPost(id!),
    enabled: !!id, // The query will only execute if `id` is not `undefined`
  });
}

/**
 * A comprehensive hook for managing a logged-in user's post and draft.
 */
export function useUserPost() {
  const queryClient = useQueryClient();

  // Calls `fetchUserPost` from `duo.ts`
  const { data, isLoading, error, refetch } = useQuery<UserPostData, Error>({
    queryKey: queryKeys.userPost,
    queryFn: fetchUserPost,
  });

  // Calls `createPost` from `duo.ts`
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      queryClient.setQueryData(queryKeys.userPost, (oldData: UserPostData | undefined) => ({
        ...oldData,
        activePost: newPost,
        savedDraft: null,
      }));
      queryClient.invalidateQueries({ queryKey: queryKeys.posts({}), refetchType: 'inactive' });
    },
  });

  // Calls `updatePost` from `duo.ts`
  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreatePostData }) => updatePost(id, data),
    onMutate: async (updatedPost) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userPost });
      const previousUserPost = queryClient.getQueryData<UserPostData>(queryKeys.userPost);
      queryClient.setQueryData(queryKeys.userPost, (old) => ({
        ...old,
        activePost: { ...old?.activePost, ...updatedPost.data, id: updatedPost.id } as DuoPost,
      }));
      return { previousUserPost };
    },
    onError: (err, newPost, context) => {
      queryClient.setQueryData(queryKeys.userPost, context?.previousUserPost);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPost });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts({}), refetchType: 'inactive' });
    },
  });

  // Calls `deletePost` from `duo.ts`
  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.userPost, (old: UserPostData | undefined) => ({
        ...old,
        activePost: null,
      }));
      queryClient.invalidateQueries({ queryKey: queryKeys.posts({}), refetchType: 'inactive' });
    },
  });

  // Calls `saveDraft` from `duo.ts`
  const saveDraftMutation = useMutation({
    mutationFn: saveDraft,
    onSuccess: (draft) => {
      queryClient.setQueryData(queryKeys.userPost, (old: UserPostData | undefined) => ({
        ...old,
        savedDraft: draft,
      }));
    },
  });

  // Calls `updateDraft` from `duo.ts`
  const updateDraftMutation = useMutation({
    mutationFn: updateDraft,
    onSuccess: (draft) => {
      queryClient.setQueryData(queryKeys.userPost, (old: UserPostData | undefined) => ({
        ...old,
        savedDraft: draft,
      }));
    },
  });

  return {
    userPostData: data,
    isLoading,
    error,
    refetch,
    createPost: createPostMutation.mutateAsync,
    updatePost: updatePostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    saveDraft: saveDraftMutation.mutateAsync,
    updateDraft: updateDraftMutation.mutateAsync,
    isMutating:
      createPostMutation.isPending ||
      updatePostMutation.isPending ||
      deletePostMutation.isPending ||
      saveDraftMutation.isPending ||
      updateDraftMutation.isPending,
  };
}

/**
 * Hook for managing post actions, independent of `useUserPost`.
 */
export function usePostActions() {
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts({}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userPost });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreatePostData }) => updatePost(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts({}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userPost });
      queryClient.invalidateQueries({ queryKey: queryKeys.post(variables.id) });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts({}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userPost });
      queryClient.removeQueries({ queryKey: queryKeys.post(deletedId) });
    },
  });

  return {
    createPost: createPostMutation.mutateAsync,
    updatePost: updatePostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
    error: createPostMutation.error || updatePostMutation.error || deletePostMutation.error,
  };
}
