import React, { useState } from "react";
import { useAdminUsers, useAdminUserActions } from "../features/admin/hooks/useAdminUsers";
import { useAdminMovies } from "../features/admin/hooks/useAdminMovies";
import { usePublicMovies } from "../features/movies/hooks/useMovies";
import { adminService } from "../features/admin/services/adminService";
import { movieService } from "../features/movies/services/movieService";
import { Search, Plus, User, Film, Trash2, ChevronLeft, ChevronRight, Eye, Edit2 } from "lucide-react";
import MovieForm from "../features/admin/components/MovieForm";
import UserDetailModal from "../features/admin/components/UserDetailModal";
import type { UserDTO, MovieResponse } from "../types";

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'movies'>('users');
    const [searchTerm, setSearchTerm] = useState("");
    const [searchById, setSearchById] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    // Users Query
    const { data: userData, isLoading: usersLoading } = useAdminUsers({
        username: activeTab === 'users' ? searchTerm : "",
        page: currentPage,
        size: pageSize,
    });

    // Movies Query
    const { data: movieData, isLoading: moviesLoading } = usePublicMovies({
        title: activeTab === 'movies' ? searchTerm : "",
        page: currentPage,
        size: pageSize,
    });

    const { deleteUserMutation } = useAdminUserActions();
    const { createMovieMutation, updateMovieMutation, deleteMovieMutation } = useAdminMovies();

    const [isMovieFormOpen, setIsMovieFormOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<MovieResponse | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handleDeleteUser = (userId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.")) {
            deleteUserMutation.mutate(userId, {
                onSuccess: () => {
                    alert("Đã xóa người dùng thành công!");
                },
                onError: (error: any) => {
                    alert("Xóa người dùng thất bại: " + error.message);
                }
            });
        }
    };

    const handleIdSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchById) {
            if (activeTab === 'users') {
                adminService.getUserById(searchById)
                    .then((res) => {
                        if (res.data.success) {
                            setSelectedUser(res.data.data);
                        } else {
                            alert("Không tìm thấy người dùng: " + res.data.message);
                        }
                    })
                    .catch(() => alert("Không tìm thấy người dùng hoặc lỗi kết nối"));
            } else {
                movieService.getMovieById(searchById)
                    .then((res) => {
                        if (res.data.success) {
                            setSelectedMovie(res.data.data);
                            setIsMovieFormOpen(true);
                        } else {
                            alert("Không tìm thấy phim: " + res.data.message);
                        }
                    })
                    .catch(() => alert("Không tìm thấy phim hoặc lỗi kết nối"));
            }
        }
    };

    const handleAddMovie = (data: Partial<MovieResponse>) => {
        createMovieMutation.mutate(data, {
            onSuccess: () => {
                setIsMovieFormOpen(false);
                alert("Đã phim thành công!");
            },
        });
    };

    const handleDeleteMovie = (movieId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bộ phim này? Hành động này không thể hoàn tác.")) {
            deleteMovieMutation.mutate(movieId, {
                onSuccess: () => {
                    alert("Đã xóa phim thành công!");
                },
                onError: (error: any) => {
                    alert("Xóa phim thất bại: " + error.message);
                }
            });
        }
    };

    const handleUpdateMovie = (data: Partial<MovieResponse>) => {
        if (selectedMovie?.movieId) {
            updateMovieMutation.mutate({ id: selectedMovie.movieId, data }, {
                onSuccess: () => {
                    setIsMovieFormOpen(false);
                    setSelectedMovie(null);
                    alert("Đã cập nhật phim thành công!");
                },
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B0B] text-white p-4 md:p-8">
            {/* Header / Brand */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-2">
                        <span className="text-amber-400">QUẢN TRỊ</span>
                        <span>DASHBOARD</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Hệ thống quản lý Aether</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setSelectedMovie(null);
                            setIsMovieFormOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        THÊM PHIM
                    </button>
                    <button className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all">
                        NHẬT KÝ
                    </button>
                </div>
            </div>

            {/* Stats Row & Tabs */}
            <div className="flex flex-col lg:flex-row gap-6 mb-10 items-end">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full">
                    <StatCard
                        icon={<User className="w-6 h-6 text-amber-400" />}
                        label="TỔNG NGƯỜI DÙNG"
                        value={userData?.totalElements || 0}
                        active={activeTab === 'users'}
                        onClick={() => { setActiveTab('users'); setCurrentPage(0); }}
                    />
                    <StatCard
                        icon={<Film className="w-6 h-6 text-purple-400" />}
                        label="TỔNG PHIM"
                        value={movieData?.totalElements || 0}
                        active={activeTab === 'movies'}
                        onClick={() => { setActiveTab('movies'); setCurrentPage(0); }}
                    />
                    <StatCard icon={<Eye className="w-6 h-6 text-green-400" />} label="ĐANG TRUY CẬP" value="12" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="rounded-2xl bg-[#141414] border border-white/5 overflow-hidden shadow-2xl transition-all">
                {/* Search & Filters */}
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={activeTab === 'users' ? "Tìm người dùng theo tên..." : "Tìm phim theo tiêu đề..."}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full bg-[#0B0B0B] border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 transition-all font-medium text-white placeholder-gray-600"
                        />
                    </div>

                    <form onSubmit={handleIdSearch} className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Tìm ID..."
                            value={searchById}
                            onChange={(e) => setSearchById(e.target.value)}
                            className="flex-1 md:w-32 bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400/50 transition-all font-medium text-white placeholder-gray-600"
                        />
                        <button
                            type="submit"
                            className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                        >
                            GO
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-white/5">
                                {activeTab === 'users' ? (
                                    <>
                                        <th className="px-6 py-4">NGƯỜI DÙNG</th>
                                        <th className="px-6 py-4">EMAIL</th>
                                        <th className="px-6 py-4">VAI TRÒ</th>
                                        <th className="px-6 py-4">TRẠNG THÁI</th>
                                        <th className="px-6 py-4">TUỔI/NGHỀ</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4">PHIM</th>
                                        <th className="px-6 py-4">PHÁT HÀNH</th>
                                        <th className="px-6 py-4">ĐẠO DIỄN</th>
                                        <th className="px-6 py-4">VIP</th>
                                        <th className="px-6 py-4">ĐÁNH GIÁ</th>
                                    </>
                                )}
                                <th className="px-6 py-4 text-right">HÀNH ĐỘNG</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {activeTab === 'users' ? (
                                usersLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-6 h-16 bg-white/5 my-2 rounded-lg"></td>
                                        </tr>
                                    ))
                                ) : userData?.content.map((user: UserDTO) => (
                                    <tr key={user.userId} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center text-amber-400 font-bold border border-amber-400/10">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {user.status ? <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                                    : <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                                                <span className="text-xs font-bold text-gray-500 uppercase">{user.status ? 'Online' : 'Offline'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {user.age || 'N/A'} • {user.occupation || 'Member'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                                    title="View Detail"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.userId)}
                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                                                    title="Delete User"
                                                    disabled={deleteUserMutation.isPending}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                moviesLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-6 h-16 bg-white/5 my-2 rounded-lg"></td>
                                        </tr>
                                    ))
                                ) : movieData?.content.map((movie: MovieResponse) => (
                                    <tr key={movie.movieId} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-14 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
                                                    <img src={movie.posterUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight line-clamp-1">{movie.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{movie.releaseDate}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{movie.director}</td>
                                        <td className="px-6 py-4">
                                            {movie.isVip ? (
                                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-black border border-amber-500/20 uppercase tracking-widest">VIP</span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded bg-white/5 text-gray-500 text-[10px] font-black border border-white/10 uppercase tracking-widest">FREE</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                <span className="text-xs font-bold text-white uppercase">{movie.avgRating?.toFixed(1) || "0.0"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedMovie(movie);
                                                        setIsMovieFormOpen(true);
                                                    }}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                                    title="Edit Movie"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMovie(movie.movieId)}
                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                                                    title="Delete Movie"
                                                    disabled={deleteMovieMutation.isPending}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Showing {activeTab === 'users' ? userData?.content.length : movieData?.content.length || 0} of {activeTab === 'users' ? userData?.totalElements : movieData?.totalElements || 0} Items
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            disabled={activeTab === 'users' ? (userData ? currentPage >= userData.totalPages - 1 : true) : (movieData ? currentPage >= movieData.totalPages - 1 : true)}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 disabled:opacity-30 hover:bg-white/10 transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isMovieFormOpen && (
                <MovieForm
                    movie={selectedMovie}
                    onSubmit={selectedMovie ? handleUpdateMovie : handleAddMovie}
                    onCancel={() => {
                        setIsMovieFormOpen(false);
                        setSelectedMovie(null);
                    }}
                    isLoading={createMovieMutation.isPending || updateMovieMutation.isPending}
                />
            )}

            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, active, onClick }: { icon: React.ReactNode; label: string; value: string | number; active?: boolean; onClick?: () => void }) => (
    <div
        onClick={onClick}
        className={`p-6 rounded-2xl border transition-all group overflow-hidden relative shadow-lg cursor-pointer ${active ? 'bg-white/10 border-white/20' : 'bg-[#141414] border-white/5 hover:border-white/10'}`}
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/[0.02] to-transparent rounded-bl-full" />
        <div className="flex items-center gap-4 mb-3 relative z-10">
            <div className="p-3 rounded-xl bg-[#0B0B0B] border border-white/5 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className={`text-xs font-black uppercase tracking-[.2em] ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
        </div>
        <div className={`text-4xl font-black transition-colors relative z-10 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{value}</div>
        {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400" />}
    </div>
);

const StarIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

export default AdminPage;
