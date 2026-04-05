export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}
export interface MovieResponse {
    movieId: number;
    title: string;
    description: string;
    trailerUrl: string;
    posterUrl: string;
    releaseDate: string;
    duration: number;
    viewCount: number;
    director: string;
    predictedRating?: number;
    genresId: number[];
    genres: string[];
}
export interface UserDTO {
    userId: number;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
    gender?: string;
    occupation?: string;
    age?: number;
    status: boolean;
    urlAvt?: String;
}
export interface CommentDTO {
    commentId: number;
    movieId: number;
    userId: number;
    username?: string; // Optinal if we want to show it
    content: string;
    createdAt: string;
}
export interface WatchListDTO {
    watchId: number;
    userId: number;
    movieId: number;
    addedAt: string
}
export interface JwtResponse {
    token: string;
    username: string;
    role: string
}
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
}
