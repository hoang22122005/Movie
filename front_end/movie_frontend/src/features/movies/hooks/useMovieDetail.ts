import { useQuery } from "@tanstack/react-query";
import { movieService } from "../services/movieService";

export const useMovieDetail = (movieId: number | string) => {
    return useQuery({
        queryKey: ["movie", movieId],
        queryFn: async () => {
            const res = await movieService.getMovieById(movieId);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
        enabled: !!movieId,
    });
};

export const useMovieComments = (movieId: number | string, params?: { page?: number; size?: number }) => {
    return useQuery({
        queryKey: ["movie", "comments", movieId, params],
        queryFn: async () => {
            const res = await movieService.getComments(movieId, params);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
        enabled: !!movieId,
    });
};
