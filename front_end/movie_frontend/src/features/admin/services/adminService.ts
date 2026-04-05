import api from "../../../api";
import type { ApiResponse, UserDTO, MovieResponse, PageResponse } from "../../../types";

export type GetUsersParams = {
    username?: string;
    email?: string;
    page?: number;
    size?: number;
};

export const adminService = {
    // 👥 User Management
    getUsers: (params: GetUsersParams) =>
        api.get<ApiResponse<PageResponse<UserDTO>>>("/admin/users", { params }),

    getUserById: (id: number | string) =>
        api.get<ApiResponse<UserDTO>>(`/admin/users/${id}`),

    deleteUser: (id: number | string) =>
        api.delete<ApiResponse<void>>(`/admin/users/${id}`),

    // 🎬 Movie Management
    createMovie: (data: Partial<MovieResponse>) =>
        api.post<ApiResponse<MovieResponse>>("/admin/movies", data),

    updateMovie: (movieId: number | string, data: Partial<MovieResponse>) =>
        api.put<ApiResponse<MovieResponse>>(`/admin/movies/${movieId}`, data),

    deleteMovie: (movieId: number | string) =>
        api.delete<ApiResponse<string>>(`/admin/movies/${movieId}`),
};
