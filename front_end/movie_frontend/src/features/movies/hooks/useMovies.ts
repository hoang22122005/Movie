import { useQuery } from "@tanstack/react-query";
import { movieService, type GetPublicMoviesParams } from "../services/movieService";

export const usePublicMovies = (params: GetPublicMoviesParams) => {
    return useQuery({
        queryKey: ["movies", "public", params],
        queryFn: async () => {
            const res = await movieService.getPublicMovies(params);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
    });
};

export const useRecommendations = () => {
    return useQuery({
        queryKey: ["movies", "recommendations"],
        queryFn: async () => {
            const res = await movieService.getRecommendations();
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
    });
};

export const useWatchedList = (params: { page: number; size: number }) => {
    return useQuery({
        queryKey: ["movies", "watched", params],
        queryFn: async () => {
            const res = await movieService.getWatchedList(params);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
    });
};

export const useHotMovies = (size: number = 10) => {
    return useQuery({
        queryKey: ["movies", "hot", size],
        queryFn: async () => {
            const res = await movieService.getHotMovies(size);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
    });
};

export const useTopRatedMovies = (size: number = 10) => {
    return useQuery({
        queryKey: ["movies", "top-rated", size],
        queryFn: async () => {
            const res = await movieService.getTopRatedMovies(size);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
    });
};
