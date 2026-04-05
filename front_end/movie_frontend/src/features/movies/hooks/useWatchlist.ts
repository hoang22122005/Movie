import { useQuery } from "@tanstack/react-query";
import { movieService, type GetWatchlistParams } from "../services/movieService";

export const useWatchlist = (params: GetWatchlistParams) => {
    return useQuery({
        queryKey: ["movies", "watchlist", params],
        queryFn: async () => {
            const res = await movieService.getWatchlist(params);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
    });
};
