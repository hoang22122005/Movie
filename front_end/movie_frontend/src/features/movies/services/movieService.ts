import api from "../../../api";
import type { ApiResponse, MovieResponse, PageResponse, CommentDTO, WatchListDTO } from "../../../types";

export type GetPublicMoviesParams = {
    title?: string;
    genreId?: number;
    page?: number;
    size?: number;
};

export type GetWatchlistParams = {
    movieName?: string;
    page?: number;
    size?: number;
};

export const movieService = {
    // 🌍 Public Movies
    getPublicMovies: (params: GetPublicMoviesParams) =>
        api.get<ApiResponse<PageResponse<MovieResponse>>>("/public/movies", { params }),

    getMovieById: (movieId: number | string) =>
        api.get<ApiResponse<MovieResponse>>(`/public/movies/${movieId}`),

    // 💬 Comments
    getComments: (movieId: number | string, params?: { page?: number; size?: number }) =>
        api.get<ApiResponse<PageResponse<CommentDTO>>>(`/public/comments/${movieId}`, { params }),

    postComment: (data: Partial<CommentDTO>) =>
        api.post<ApiResponse<CommentDTO>>(`/users/comments`, data),

    updateComment: (data: Partial<CommentDTO>) =>
        api.put<ApiResponse<CommentDTO>>(`/users/comments`, data),

    deleteComment: (commentId: number) =>
        api.delete<ApiResponse<string>>(`/users/comments/${commentId}`),

    // 📌 Watchlist
    getWatchlist: (params: GetWatchlistParams) =>
        api.get<ApiResponse<PageResponse<MovieResponse>>>("/user/watchlists", { params }),

    addToWatchlist: (movieId: number) =>
        api.post<ApiResponse<WatchListDTO>>(`/user/watchlists/${movieId}`),

    removeFromWatchlist: (movieId: number) =>
        api.delete<ApiResponse<string>>(`/user/watchlists/${movieId}`),

    // 🤖 Specialized Lists
    getRecommendations: () =>
        api.get<ApiResponse<MovieResponse[]>>("/movies/recommendations"),

    getWatchedList: (params: { page: number; size: number }) =>
        api.get<ApiResponse<PageResponse<MovieResponse>>>("/movies/watched-list", { params })
};
