import VideoCard from './VideoCard';
import { useHotMovies } from '../hooks/useMovies';
import type { MovieResponse } from '../../../types';

interface HotStreamingSectionProps {
    onMovieClick: (movie: MovieResponse) => void;
}

export default function HotStreamingSection({ onMovieClick }: HotStreamingSectionProps) {
    const { data: hotMoviesData, isLoading } = useHotMovies(6);
    const hotMovies = hotMoviesData?.content;

    return (
        <section className="px-8 md:px-16 mb-16">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-red-500 rounded-full animate-pulse" />
                Hot Streaming Now
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="aspect-video bg-surface-light rounded-2xl animate-pulse"></div>
                    ))
                ) : (
                    hotMovies?.map((movie) => (
                        <VideoCard
                            key={movie.movieId}
                            image={movie.posterUrl}
                            title={movie.title}
                            metadata={`${movie.genres?.join(' • ') || 'N/A'} • ${movie.duration}m`}
                            rating={movie.avgRating?.toFixed(1) || "0.0"}
                            views={movie.viewCount}
                            badge="HOT"
                            isVip={movie.isVip}
                            onClick={() => onMovieClick(movie)}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
