import { useState, useEffect } from "react";
import { Search, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useWatchlist } from "../features/movies/hooks/useWatchlist";
import MovieCard from "../shared/MovieCard";
import { AnimatePresence, motion } from "motion/react";
import { MovieOverlay } from "../features/movies/components/MoiveOverlay";
import type { MovieResponse } from "../types";

export default function WatchlistPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedMovie, setSelectedMovie] = useState<MovieResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 12;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: moviesData, isLoading, error } = useWatchlist({
        movieName: debouncedSearch,
        page: currentPage,
        size: itemsPerPage
    });

    const movies = moviesData?.content || [];
    const pageInfo = moviesData;

    const totalPages = pageInfo?.totalPages || 0;

    const getPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) pageNumbers.push(i);
        } else {
            pageNumbers.push(0);
            if (currentPage > 2) pageNumbers.push("...");

            const start = Math.max(1, currentPage - 1);
            const end = Math.min(totalPages - 2, currentPage + 1);

            for (let i = start; i <= end; i++) pageNumbers.push(i);

            if (currentPage < totalPages - 3) pageNumbers.push("...");
            pageNumbers.push(totalPages - 1);
        }
        return pageNumbers;
    };

    return (
        <div className="min-h-screen bg-surface p-6 md:p-10">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                                <Heart size={24} fill="currentColor" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
                                My <span className="text-primary">Watchlist</span>
                            </h1>
                        </div>
                        <p className="text-neutral-500 text-sm font-medium">
                            {pageInfo && pageInfo.totalElements > 0
                                ? `You have ${pageInfo.totalElements} cinematics saved for later`
                                : "Your personal collection of must-watch masterpieces"}
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find in watchlist..."
                            className="w-full bg-surface-light/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all backdrop-blur-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {[...Array(itemsPerPage)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-surface-light animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="py-20 text-center glass-card rounded-3xl border border-red-500/20">
                        <p className="text-red-400 font-bold mb-4">Error: {error?.message}</p>
                        <button className="px-6 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary/20 transition-all font-bold text-sm uppercase">
                            Retry
                        </button>
                    </div>
                ) : movies.length > 0 ? (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
                        >
                            {movies.map((movie) => (
                                <MovieCard
                                    key={movie.movieId}
                                    image={movie.posterUrl}
                                    title={movie.title}
                                    genre={movie.genres.join(', ')}
                                    year={movie.releaseDate?.split('-')[0]}
                                    isVip={movie.isVip}
                                    onClick={() => setSelectedMovie(movie)}
                                />
                            ))}
                        </motion.div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-16 flex justify-center items-center gap-2">
                                {getPageNumbers().map((num, i) => (
                                    num === "..." ? (
                                        <span key={`ellipsis-${i}`} className="w-10 text-center text-neutral-600 font-bold">...</span>
                                    ) : (
                                        <button
                                            key={`page-${num}`}
                                            onClick={() => setCurrentPage(num as number)}
                                            className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === num
                                                ? "bg-primary text-black shadow-[0_0_20px_rgba(212,168,83,0.3)]"
                                                : "bg-surface-light text-neutral-500 hover:text-white"
                                                }`}
                                        >
                                            {(num as number) + 1}
                                        </button>
                                    )
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-32 flex flex-col items-center justify-center text-center glass-card rounded-[40px] border border-white/5 bg-gradient-to-b from-white/5 to-transparent"
                    >
                        <div className="w-24 h-24 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mb-8 text-neutral-700">
                            <Heart size={48} strokeWidth={1} />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Your watchlist is empty</h3>
                        <p className="text-neutral-500 max-w-md mx-auto mb-10 font-medium">
                            Looks like you haven't saved any movies yet. Start exploring our vast collection to build your library.
                        </p>
                        <Link
                            to="/browse"
                            className="group flex items-center gap-3 bg-primary text-primary-dark px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:brightness-110 transition-all hover:shadow-[0_0_30px_rgba(212,168,83,0.4)]"
                        >
                            Explore Movies
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                )}
            </div>

            {/* Detailed Overlay */}
            <AnimatePresence>
                {selectedMovie && (
                    <MovieOverlay
                        movie={selectedMovie}
                        onClose={() => setSelectedMovie(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
