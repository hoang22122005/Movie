import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { usePublicMovies } from "../features/movies/hooks/useMovies";
import MovieCard from "../shared/MovieCard";
import { AnimatePresence } from "motion/react";
import { MovieOverlay } from "../features/movies/components/MoiveOverlay";
import type { MovieResponse } from "../types";

const CATEGORIES = [
    { id: 0, name: "Tất cả thể loại" },
    { id: 2, name: "Hành động" },
    { id: 3, name: "Phiêu lưu" },
    { id: 4, name: "Hoạt hình" },
    { id: 5, name: "Trẻ em" },
    { id: 6, name: "Hài kịch" },
    { id: 7, name: "Tội phạm" },
    { id: 8, name: "Phim tài liệu" },
    { id: 9, name: "Kịch" },
    { id: 10, name: "Giả tưởng" },
    { id: 11, name: "Phim đen" },
    { id: 12, name: "Kinh dị" },
    { id: 13, name: "Nhạc kịch" },
    { id: 14, name: "Bí ẩn" },
    { id: 15, name: "Lãng mạn" },
    { id: 16, name: "Viễn tưởng" },
    { id: 17, name: "Giật gân" },
    { id: 18, name: "Chiến tranh" },
    { id: 19, name: "Miền Tây" }
];

export default function BrowsePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryTerm = searchParams.get("q") || "";

    const [searchTerm, setSearchTerm] = useState(queryTerm);
    const [debouncedSearch, setDebouncedSearch] = useState(queryTerm);
    const [selectedGenreId, setSelectedGenreId] = useState<number | undefined>(undefined);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [selectedMovie, setSelectedMovie] = useState<MovieResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 12;

    // Sync input with URL search param
    useEffect(() => {
        //lấy dữ liệu từ param của url khi ấn vào thể loại phim ở userhomepage
        setSearchTerm(queryTerm);
        //tự động thay đổi khi gõ để lấy danh dách phim đó về
        setDebouncedSearch(queryTerm);

        const genreId = searchParams.get("genreId");
        if (genreId) {
            setSelectedGenreId(Number(genreId));
        }
    }, [queryTerm, searchParams]);

    // Update URL when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setSearchParams(prev => {
                if (searchTerm) prev.set("q", searchTerm);
                else prev.delete("q");
                return prev;
            });
            setCurrentPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, setSearchParams]);

    const { data: moviesData, isLoading, error } = usePublicMovies({
        title: debouncedSearch,
        genreId: selectedGenreId === 0 ? undefined : selectedGenreId,
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
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase mb-2">
                            Khám phá <span className="text-primary">Thư viện</span>
                        </h1>
                        <p className="text-neutral-500 text-sm font-medium">
                            {searchTerm || selectedGenreId
                                ? `Hiển thị kết quả cho ${searchTerm ? `"${searchTerm}"` : ""} ${selectedGenreId ? `trong ${CATEGORIES.find(c => c.id === selectedGenreId)?.name}` : ""}`
                                : "Khám phá bộ sưu tập khổng lồ các kiệt tác điện ảnh của chúng tôi"}
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex items-center gap-4 w-full md:w-auto relative">
                        <div className="relative flex-1 md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tựa phim, diễn viên, thể loại..."
                                className="w-full bg-surface-light/40 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-neutral-600 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all backdrop-blur-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Genre Filter Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`h-[58px] px-6 rounded-2xl border transition-all flex items-center gap-2 group ${isFilterOpen ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-light/40 border-white/5 text-white hover:bg-white/5'}`}
                            >
                                <SlidersHorizontal size={20} className={isFilterOpen ? 'text-primary' : 'text-neutral-500 group-hover:text-primary transition-colors'} />
                                <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">
                                    {selectedGenreId ? CATEGORIES.find(c => c.id === selectedGenreId)?.name : "Bộ lọc"}
                                </span>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isFilterOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-56 bg-surface-light/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden py-2 p-1">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setSelectedGenreId(cat.id === 0 ? undefined : cat.id);
                                                        setIsFilterOpen(false);
                                                        setCurrentPage(0);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1 ${selectedGenreId === cat.id || (cat.id === 0 && selectedGenreId === undefined) ? 'bg-primary text-black' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {cat.name}
                                                    {(selectedGenreId === cat.id || (cat.id === 0 && selectedGenreId === undefined)) && <Check size={16} />}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto">
                {error ? (
                    <div className="py-20 text-center">
                        <p className="text-red-400 font-bold mb-4">Lỗi: {error?.message}</p>
                        <button className="px-6 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary/20 transition-all font-bold text-sm uppercase">
                            Thử lại
                        </button>
                    </div>
                ) : isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                        {[...Array(itemsPerPage)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-surface-light animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : movies.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                            {movies.map((movie) => (
                                <MovieCard
                                    key={movie.movieId}
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
                    <div className="py-40 text-center">
                        <div className="w-20 h-20 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={32} className="text-neutral-700" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Không tìm thấy kết quả</h3>
                        <p className="text-neutral-500 max-w-xs mx-auto text-sm leading-relaxed">
                            Chúng tôi không tìm thấy bộ phim nào phù hợp với "{searchTerm}". Hãy thử từ khóa khác hoặc kiểm tra lại chính tả.
                        </p>
                    </div>
                )}
            </div>

            {/* Movie Overlay */}
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

