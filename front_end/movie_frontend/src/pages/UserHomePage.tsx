import Hero from "../features/movies/components/Hero.tsx";
import MovieCard from "../shared/MovieCard.tsx";
import GenreCard from '../features/movies/components/GenreCard';
import SpotlightBanner from '../features/movies/components/SpotlightBanner';
import VideoCard from '../features/movies/components/VideoCard';
import HotStreamingSection from '../features/movies/components/HotStreamingSection';
import TopRatedSection from '../features/movies/components/TopRatedSection';
import { usePublicMovies, useRecommendations, useWatchedList } from "../features/movies/hooks/useMovies";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence } from "motion/react";
import { MovieOverlay } from "../features/movies/components/MoiveOverlay.tsx";
import type { MovieResponse } from "../types";

export default function App() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Tự động làm mới danh sách phim đã xem khi quay lại trang chủ
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ["movies", "watched"] });
    }, [queryClient]);

    // Fetch Featured Movies (Hero)
    const { data: featuredData, isLoading: isLoadingHero, error: errorHero } = usePublicMovies({ page: 0, size: 10 });
    const featuredMovies = featuredData?.content;
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [selectedMovie, setSelectedMovie] = useState<MovieResponse | null>(null);

    // Tự động chuyển phim sau 5 giây
    useEffect(() => {
        if (!featuredMovies || featuredMovies.length === 0) return;

        const timer = setInterval(() => {
            setFeaturedIndex((prev) => (prev + 1) % featuredMovies.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [featuredMovies]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Fetch Dynamic Data
    const {
        data: watchedData,
        isLoading: isLoadingWatchedList,
        error: errorWatchedList
    } = useWatchedList({ page: currentPage - 1, size: itemsPerPage });

    const movieWatchedList = watchedData?.content;
    const pageInfo = watchedData;

    const { data: moviesRecommendation, isLoading: isLoadingRecommendation, error: errorRecommendation } = useRecommendations();

    const totalPages = pageInfo?.totalPages || 0;

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);

            if (currentPage > 3) {
                pageNumbers.push('...');
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pageNumbers.includes(i)) {
                    pageNumbers.push(i);
                }
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }

            if (!pageNumbers.includes(totalPages)) {
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    return (
        <>
            {/* Hero Section - Auto Slider */}
            <Hero
                movie={featuredMovies?.[featuredIndex]}
                isLoading={isLoadingHero}
                error={errorHero?.message}
            />


            {/* Recommended Section */}
            <section className="px-8 md:px-16 -mt-12 relative z-10 mb-16">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-primary rounded-full" />
                    Recommended for You
                </h3>

                {isLoadingRecommendation ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-surface-light rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : errorRecommendation ? (
                    <div className="py-10 text-red-500">Không thể tải danh sách gợi ý.</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                        {moviesRecommendation?.map((movie, i) => (
                            <MovieCard
                                key={i}
                                image={movie.posterUrl}
                                title={movie.title}
                                genre={movie.genres.join(', ')}
                                year={movie.releaseDate?.split('-')[0]}
                                views={movie.viewCount}
                                rating={movie.avgRating?.toFixed(1)}
                                isVip={movie.isVip}
                                onClick={() => setSelectedMovie(movie)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Genres Section */}
            <section className="px-8 md:px-16 mb-16">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-amber-400 rounded-full" />
                    My Genres
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                    {[
                        { id: 2, image: 'https://picsum.photos/seed/action/400/300', label: 'Action', color: 'bg-indigo-500/40' },
                        { id: 3, image: 'https://picsum.photos/seed/adventure/400/300', label: 'Adventure', color: 'bg-green-500/40' },
                        { id: 4, image: 'https://picsum.photos/seed/animation/400/300', label: 'Animation', color: 'bg-pink-500/40' },
                        { id: 5, image: 'https://picsum.photos/seed/children/400/300', label: 'Children', color: 'bg-sky-500/40' },
                        { id: 6, image: 'https://picsum.photos/seed/comedy/400/300', label: 'Comedy', color: 'bg-yellow-500/40' },
                        { id: 7, image: 'https://picsum.photos/seed/crime/400/300', label: 'Crime', color: 'bg-slate-700/60' },
                        { id: 8, image: 'https://picsum.photos/seed/documentary/400/300', label: 'Documentary', color: 'bg-blue-500/40' },
                        { id: 9, image: 'https://picsum.photos/seed/drama/400/300', label: 'Drama', color: 'bg-purple-500/40' },
                        { id: 10, image: 'https://picsum.photos/seed/fantasy/400/300', label: 'Fantasy', color: 'bg-emerald-500/40' },
                        { id: 11, image: 'https://picsum.photos/seed/filmnoir/400/300', label: 'Film-Noir', color: 'bg-neutral-800/80' },
                        { id: 12, image: 'https://picsum.photos/seed/horror/400/300', label: 'Horror', color: 'bg-red-500/40' },
                        { id: 13, image: 'https://picsum.photos/seed/musical/400/300', label: 'Musical', color: 'bg-violet-500/40' },
                        { id: 14, image: 'https://picsum.photos/seed/mystery/400/300', label: 'Mystery', color: 'bg-teal-500/40' },
                        { id: 15, image: 'https://picsum.photos/seed/romance/400/300', label: 'Romance', color: 'bg-rose-500/40' },
                        { id: 16, image: 'https://picsum.photos/seed/scifi/400/300', label: 'Sci-Fi', color: 'bg-primary/40' },
                        { id: 17, image: 'https://picsum.photos/seed/thriller/400/300', label: 'Thriller', color: 'bg-orange-500/40' },
                        { id: 18, image: 'https://picsum.photos/seed/war/400/300', label: 'War', color: 'bg-stone-500/40' },
                        { id: 19, image: 'https://picsum.photos/seed/western/400/300', label: 'Western', color: 'bg-amber-700/50' }
                    ].map((genre, i) => (
                        <div key={i} className="min-w-[240px]">
                            <GenreCard
                                image={genre.image}
                                label={genre.label}
                                color={genre.color}
                                onClick={() => navigate(`/browse?genreId=${genre.id}`)}
                            />
                        </div>
                    ))}
                </div>
            </section>

            <SpotlightBanner />

            <HotStreamingSection onMovieClick={setSelectedMovie} />

            <TopRatedSection onMovieClick={setSelectedMovie} />

            {/* Newly Added Section */}
            <section className="px-8 md:px-16 mb-24">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-primary rounded-full" />
                        Watched Recent
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center text-white hover:bg-primary hover:text-primary-dark transition-all disabled:opacity-30 disabled:hover:bg-surface-light disabled:hover:text-white"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((number, i) => (
                                    <button
                                        key={i}
                                        onClick={() => typeof number === 'number' ? paginate(number) : null}
                                        disabled={typeof number !== 'number'}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === number
                                            ? 'bg-primary text-primary-dark'
                                            : typeof number === 'number'
                                                ? 'bg-surface-light text-neutral-400 hover:text-white'
                                                : 'bg-transparent text-neutral-500 cursor-default'
                                            }`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center text-white hover:bg-primary hover:text-primary-dark transition-all disabled:opacity-30 disabled:hover:bg-surface-light disabled:hover:text-white"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <a href="#" className="text-primary text-sm font-bold hover:underline hidden sm:block">View All</a>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoadingWatchedList ? (
                        <div className="col-span-full text-center py-20 text-neutral-500">
                            <div className="animate-pulse flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p>Đang tải danh sách phim...</p>
                            </div>
                        </div>
                    ) : errorWatchedList ? (
                        <div className="col-span-full text-center py-20 text-red-500 bg-red-500/5 rounded-2xl border border-red-500/20">
                            <p className="font-bold mb-2">Đã xảy ra lỗi!</p>
                            <p className="text-sm">{errorWatchedList?.message}</p>
                        </div>
                    ) : movieWatchedList && movieWatchedList.length > 0 ? (
                        movieWatchedList.map((movie) => (
                            <VideoCard
                                key={movie.movieId}
                                image={movie.posterUrl}
                                title={movie.title}
                                metadata={`${movie.genres?.join(' • ') || 'N/A'} • ${movie.duration}m`}
                                rating={movie.avgRating?.toFixed(1) || "0.0"}
                                views={movie.viewCount}
                                badge={movie.viewCount > 100 ? "POPULAR" : "WATCHED"}
                                isVip={movie.isVip}
                                onClick={() => setSelectedMovie(movie)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-neutral-500">
                            Bạn chưa xem phim nào gần đây.
                        </div>
                    )}
                </div>
            </section>

            <AnimatePresence>
                {selectedMovie && (
                    <MovieOverlay
                        movie={selectedMovie}
                        onClose={() => setSelectedMovie(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
