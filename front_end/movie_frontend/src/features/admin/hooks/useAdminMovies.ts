import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import type { MovieResponse } from "../../../types";

export const useAdminMovies = () => {
    const queryClient = useQueryClient();

    const createMovieMutation = useMutation({
        mutationFn: async (data: Partial<MovieResponse>) => {
            const res = await adminService.createMovie(data);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movies"] });
        },
    });

    const updateMovieMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number | string; data: Partial<MovieResponse> }) => {
            const res = await adminService.updateMovie(id, data);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movies"] });
        },
    });

    const deleteMovieMutation = useMutation({
        mutationFn: async (id: number | string) => {
            const res = await adminService.deleteMovie(id);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["movies"] });
        },
    });

    return {
        createMovieMutation,
        updateMovieMutation,
        deleteMovieMutation,
    };
};
