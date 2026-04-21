import MovieCard from '../../../shared/MovieCard';
import { useTopRatedMovies } from '../hooks/useMovies';
import type { MovieResponse } from '../../../types';

interface TopRatedSectionProps {
    onMovieClick: (movie: MovieResponse) => void;
}

export default function TopRatedSection({ onMovieClick }: TopRatedSectionProps) {
    const { data: topRatedData, isLoading } = useTopRatedMovies(8);
    const topRatedMovies = topRatedData?.content;

    return (
        <section className="px-8 md:px-16 mb-16">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                Top Rated Masterpieces
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                {isLoading ? (
                    [...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-surface-light rounded-xl animate-pulse"></div>
                    ))
                ) : (
                    topRatedMovies?.map((movie) => (
                        <MovieCard
                            key={movie.movieId}
                            image={movie.posterUrl}
                            title={movie.title}
                            genre={movie.genres.join(', ')}
                            year={movie.releaseDate?.split('-')[0]}
                            views={movie.viewCount}
                            rating={movie.avgRating?.toFixed(1)}
                            isVip={movie.isVip}
                            onClick={() => onMovieClick(movie)}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
