import { Play, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { MovieResponse } from "../../../types";

/**
 * Hàm làm sạch và tách tiêu đề phim chuyên nghiệp
 */
function splitTitle(title: string): { top: string; bottom: string } {
    let cleanTitle = title.trim();

    // 1. Bỏ phần trước dấu ":" (Ví dụ: "Avengers: Endgame" -> "Endgame")
    if (cleanTitle.includes(':')) {
        const parts = cleanTitle.split(':');
        cleanTitle = parts[parts.length - 1].trim();
    }

    // 2. Bỏ năm sản xuất "(2024)" ở cuối
    cleanTitle = cleanTitle.replace(/\s*\(\d{4}\)$/, "").trim();

    const words = cleanTitle.split(/\s+/).filter(Boolean);
    if (words.length <= 1) return { top: cleanTitle, bottom: "" };
    return { top: words[0], bottom: words.slice(1).join(" ") };
}

import { useToast } from "../../../context/ToastContext";
import { useWatchlistActions } from "../hooks/useMovieActions";

interface HeroProps {
    movie?: MovieResponse | null;
    isLoading?: boolean;
    error?: string | null;
}

export default function Hero({ movie, isLoading, error }: HeroProps) {
    const { toast } = useToast();
    const { addToWatchlistMutation } = useWatchlistActions();
    const isAdding = addToWatchlistMutation.isPending;
    const navigate = useNavigate();

    const handleAddToWatchlist = async () => {
        if (!movie) return;
        try {
            await addToWatchlistMutation.mutateAsync(movie.movieId);
            toast(`Added "${movie.title}" to your watchlist`, "success");
        } catch (err) {
            toast("You have already added this movie or an error occurred", "error");
        }
    };
    // Chế biến dữ liệu thật từ Props
    const movieData = useMemo(() => {
        if (!movie) return null;

        return {
            titleParts: splitTitle(movie.title),
            description: movie.description,
            posterUrl: movie.posterUrl,
            releaseYear: movie.releaseDate ? String(movie.releaseDate).slice(0, 4) : "",
            genres: movie.genres?.length ? movie.genres.slice(0, 2).join(" / ") : "",
            durationLabel: movie.duration
                ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`
                : "",
        };
    }, [movie]);

    // 1. Nếu đang tải: Hiện hiệu ứng Loading (Bạn có thể thay bằng Skeleton nếu muốn)
    if (isLoading) {
        return (
            <section className="relative w-full h-[80vh] flex items-center justify-center bg-black">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </section>
        );
    }

    // 2. Nếu có lỗi hoặc không có dữ liệu phim: Trả về null
    if (error || !movieData) return null;

    return (
        <section className="relative w-full h-[95vh] min-h-[700px] overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={movie?.movieId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0">
                        <img
                            src={movieData.posterUrl}
                            alt={movie?.title || "Movie poster"}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                (e.target as HTMLImageElement).className = "w-full h-full bg-neutral-900 object-cover";
                            }}
                        />
                        <div className="hero-gradient absolute inset-0" />
                    </div>

                    <div className="relative h-full flex flex-col justify-end px-8 md:px-16 pb-24 max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="mb-4 flex items-center gap-3"
                        >
                            <span className="px-2 py-0.5 bg-primary text-primary-dark text-[10px] font-bold rounded uppercase">
                                Nổi bật
                            </span>
                            <span className="text-neutral-300 text-xs font-medium tracking-wide">
                                {movieData.releaseYear} • {movieData.genres} • {movieData.durationLabel}
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="text-6xl md:text-8xl font-black italic tracking-tighter text-white leading-[0.9] mb-6"
                        >
                            {movieData.titleParts.top}
                            {movieData.titleParts.bottom && <><br />{movieData.titleParts.bottom}</>}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-base text-neutral-300 max-w-xl mb-8 leading-relaxed line-clamp-3"
                        >
                            {movieData.description}
                        </motion.p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => navigate(`/watch/${movie?.movieId}`)}
                                className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-dark font-bold rounded-xl hover:scale-105 transition-transform cursor-pointer"
                            >
                                <Play size={18} fill="currentColor" />
                                XEM NGAY
                            </button>
                            <button
                                onClick={handleAddToWatchlist}
                                disabled={isAdding}
                                className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isAdding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                DANH SÁCH CỦA TÔI
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
}
