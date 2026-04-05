import React, { useState } from "react";
import { useAdminUsers, useAdminUserActions } from "../features/admin/hooks/useAdminUsers";
import { useAdminMovies } from "../features/admin/hooks/useAdminMovies";
import { adminService } from "../features/admin/services/adminService";
import { Search, Plus, User, Film, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import MovieForm from "../features/admin/components/MovieForm";
import UserDetailModal from "../features/admin/components/UserDetailModal";
import type { UserDTO, MovieResponse } from "../types";

const AdminPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchById, setSearchById] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    const { data: userData, isLoading: usersLoading } = useAdminUsers({
        username: searchTerm,
        page: currentPage,
        size: pageSize,
    });

    const { deleteUserMutation } = useAdminUserActions();
    const { createMovieMutation, updateMovieMutation } = useAdminMovies();

    const [isMovieFormOpen, setIsMovieFormOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<MovieResponse | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handleDeleteUser = (userId: number) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            deleteUserMutation.mutate(userId, {
                onSuccess: () => {
                    alert("User deleted successfully!");
                },
                onError: (error: any) => {
                    alert("Failed to delete user: " + error.message);
                }
            });
        }
    };

    const handleIdSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchById) {
            adminService.getUserById(searchById)
                .then((res) => {
                    if (res.data.success) {
                        setSelectedUser(res.data.data);
                    } else {
                        alert("User not found: " + res.data.message);
                    }
                })
                .catch(() => alert("User not found or connection error"));
        }
    };

    const handleAddMovie = (data: Partial<MovieResponse>) => {
        createMovieMutation.mutate(data, {
            onSuccess: () => {
                setIsMovieFormOpen(false);
                alert("Movie created successfully!");
            },
        });
    };

    const handleUpdateMovie = (data: Partial<MovieResponse>) => {
        if (selectedMovie?.movieId) {
            updateMovieMutation.mutate({ id: selectedMovie.movieId, data }, {
                onSuccess: () => {
                    setIsMovieFormOpen(false);
                    setSelectedMovie(null);
                    alert("Movie updated successfully!");
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
                        <span className="text-amber-400">ADMIN</span>
                        <span>DASHBOARD</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Aether Management Console</p>
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
                        ADD MOVIE
                    </button>
                    <button className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all">
                        LOGS
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard icon={<User className="w-6 h-6 text-amber-400" />} label="TOTAL USERS" value={userData?.totalElements || 0} />
                <StatCard icon={<Film className="w-6 h-6 text-purple-400" />} label="TOTAL MOVIES" value="234" />
                <StatCard icon={<Eye className="w-6 h-6 text-green-400" />} label="ACTIVE NOW" value="12" />
            </div>

            {/* Main Content Area */}
            <div className="rounded-2xl bg-[#141414] border border-white/5 overflow-hidden shadow-2xl transition-all">
                {/* Search & Filters */}
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Find user by name..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full bg-[#0B0B0B] border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 transition-all font-medium text-white placeholder-gray-600"
                        />
                    </div>

                    <form onSubmit={handleIdSearch} className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="ID Search..."
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
                                <th className="px-6 py-4">USER</th>
                                <th className="px-6 py-4">EMAIL</th>
                                <th className="px-6 py-4">ROLE</th>
                                <th className="px-6 py-4">STATUS</th>
                                <th className="px-6 py-4">AGE/JOB</th>
                                <th className="px-6 py-4 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {usersLoading ? (
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Showing {userData?.content.length || 0} of {userData?.totalElements || 0} Users
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
                            disabled={userData ? currentPage >= userData.totalPages - 1 : true}
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

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
    <div className="p-6 rounded-2xl bg-[#141414] border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/[0.02] to-transparent rounded-bl-full" />
        <div className="flex items-center gap-4 mb-3 relative z-10">
            <div className="p-3 rounded-xl bg-[#0B0B0B] border border-white/5 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-xs font-black text-gray-500 uppercase tracking-[.2em]">{label}</span>
        </div>
        <div className="text-4xl font-black text-white group-hover:text-amber-400 transition-colors relative z-10">{value}</div>
    </div>
);

export default AdminPage;
