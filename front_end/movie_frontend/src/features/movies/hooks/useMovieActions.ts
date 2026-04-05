import { useMutation, useQueryClient } from "@tanstack/react-query";
import { movieService } from "../services/movieService";
import type { CommentDTO } from "../../../types";

export const useCommentActions = (movieId: number | string) => {
    const queryClient = useQueryClient();

    const postCommentMutation = useMutation({
        mutationFn: (data: Partial<CommentDTO>) => movieService.postComment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movie", "comments", movieId] });
        },
    });

    const updateCommentMutation = useMutation({
        mutationFn: (data: Partial<CommentDTO>) => movieService.updateComment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movie", "comments", movieId] });
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: number) => movieService.deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movie", "comments", movieId] });
        },
    });

    return { postCommentMutation, updateCommentMutation, deleteCommentMutation };
};

export const useWatchlistActions = () => {
    const queryClient = useQueryClient();

    const addToWatchlistMutation = useMutation({
        mutationFn: (movieId: number) => movieService.addToWatchlist(movieId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movies", "watchlist"] });
        },
    });

    const removeFromWatchlistMutation = useMutation({
        mutationFn: (movieId: number) => movieService.removeFromWatchlist(movieId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movies", "watchlist"] });
        },
    });

    return { addToWatchlistMutation, removeFromWatchlistMutation };
};
