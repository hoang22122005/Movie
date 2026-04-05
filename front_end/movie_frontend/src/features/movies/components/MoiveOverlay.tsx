import {
    X,
    Play,
    Plus,
    Send,
    Loader2,
    Edit2,
    Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MovieResponse, CommentDTO } from "../../../types";
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { useWatchlistActions, useCommentActions } from '../hooks/useMovieActions';
import { useMovieComments } from '../hooks/useMovieDetail';

/**
 * Utility for merging tailwind classes
 */
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MovieOverlayProps {
    movie: MovieResponse;
    onClose: () => void;
}

export const MovieOverlay = ({ movie, onClose }: MovieOverlayProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { addToWatchlistMutation } = useWatchlistActions();
    const { data: commentsData, isLoading: isCommentsLoading } = useMovieComments(movie.movieId);
    const comments = commentsData?.content || [];
    const { postCommentMutation, updateCommentMutation, deleteCommentMutation } = useCommentActions(movie.movieId || "");

    const isAdding = addToWatchlistMutation.isPending;
    const isAddingComment = postCommentMutation.isPending;

    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");

    // Ẩn Navbar và chặn cuộn trang khi Overlay mở
    useEffect(() => {
        document.body.classList.add('overlay-open');
        return () => {
            document.body.classList.remove('overlay-open');
        };
    }, []);

    const handleAddToWatchlist = async () => {
        try {
            await addToWatchlistMutation.mutateAsync(movie.movieId);
            toast(`Added "${movie.title}" to your watchlist`, "success");
        } catch (err) {
            toast("You have already added this movie or an error occurred", "error");
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        try {
            await postCommentMutation.mutateAsync({ content: newComment, movieId: movie.movieId });
            setNewComment("");
            toast("Comment posted!", "success");
        } catch (err) {
            toast("Failed to post comment", "error");
        }
    };

    const handleSaveEdit = async (commentId: number) => {
        if (!editContent.trim()) return;
        try {
            await updateCommentMutation.mutateAsync({ commentId, content: editContent, movieId: movie.movieId });
            setEditingCommentId(null);
            toast("Comment updated!", "success");
        } catch (err) {
            toast("Failed to update comment", "error");
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await deleteCommentMutation.mutateAsync(commentId);
            toast("Comment deleted", "info");
        } catch (err) {
            toast("Failed to delete", "error");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 md:p-12"
        >
            {/* Backdrop Blur and Dimming */}
            <div className="absolute inset-0 bg-surface/80 backdrop-blur-xl" onClick={onClose}></div>

            {/* Modal Container */}
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 450, mass: 0.8 }}
                className="relative w-full max-w-6xl h-full max-h-[870px] rounded-[2rem] overflow-hidden bg-surface-container shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col md:flex-row border border-white/5"
            >
                {/* Hero Image Background */}
                <div className="absolute inset-0 -z-10">
                    <img
                        alt="Background"
                        className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
                        src={movie.posterUrl}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-surface-container via-transparent to-surface-container-lowest/50"></div>
                </div>

                {/* Left: Cinematic Visuals & Actions */}
                <div className="w-full md:w-[45%] h-64 md:h-full relative overflow-hidden group">
                    <img
                        alt="Movie Poster"
                        className="w-full h-full object-cover"
                        src={movie.posterUrl}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>

                    <div className="absolute bottom-8 left-8 right-8">
                        <div className="flex items-center gap-2 mb-4">
                            {movie.viewCount > 1000 && (
                                <span className="px-3 py-1 bg-primary text-on-primary text-[10px] font-bold tracking-widest rounded-full uppercase">Hot</span>
                            )}
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold tracking-widest rounded-full uppercase">IMDB {movie.viewCount}</span>
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tighter text-white mb-6 leading-tight uppercase line-clamp-2">
                            {movie.title}
                        </h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate(`/watch/${movie.movieId}`)}
                                className="flex-1 py-4 bg-gradient-to-r from-primary to-primary/80 text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(212,168,83,0.3)] hover:scale-[1.02] transition-transform"
                            >
                                <Play size={20} fill="currentColor" />
                                Watch Now
                            </button>
                            <button
                                onClick={handleAddToWatchlist}
                                disabled={isAdding}
                                className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50"
                            >
                                {isAdding ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Metadata and Comments */}
                <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto no-scrollbar relative min-w-0">
                    {/* Header Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <div>
                            <p className="text-[10px] text-outline uppercase tracking-[0.2em] mb-1">Director</p>
                            <p className="text-on-surface font-medium">{movie.director || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-outline uppercase tracking-[0.2em] mb-1">Duration</p>
                            <p className="text-primary font-bold">{movie.duration}m</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-outline uppercase tracking-[0.2em] mb-1">Genre</p>
                            <p className="text-on-surface font-medium truncate">{movie.genres?.join(', ') || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-outline uppercase tracking-[0.2em] mb-1">Release</p>
                            <p className="text-on-surface font-medium">{movie.releaseDate?.split('-')[0] || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="mb-12">
                        <p className="text-[10px] text-outline uppercase tracking-[0.2em] mb-3">Description</p>
                        <p className="text-on-surface/80 text-lg leading-relaxed font-light line-clamp-6">
                            {movie.description}
                        </p>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold tracking-tight uppercase italic">Audience Feed</h3>
                            <span className="text-xs text-outline">{comments.length} comments</span>
                        </div>

                        <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                            {isCommentsLoading ? (
                                <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
                            ) : comments.length === 0 ? (
                                <p className="text-outline text-sm italic text-center py-10">No comments yet. Be the first to share your thoughts!</p>
                            ) : (
                                comments.map((c: CommentDTO) => (
                                    <div key={c.commentId} className="flex gap-4 group/comment">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex-shrink-0 flex items-center justify-center text-primary text-xs font-black uppercase">
                                            {c.username ? c.username.substring(0, 2) : (c.userId % 100)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-white truncate max-w-[120px]">{c.username || `User #${c.userId}`}</span>
                                                    <span className="text-[9px] text-outline uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                {/* Actions for owner */}
                                                {user?.userId === c.userId && (
                                                    <div className="flex gap-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingCommentId(c.commentId);
                                                                setEditContent(c.content);
                                                            }}
                                                            className="p-1 hover:text-primary transition-colors"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(c.commentId)}
                                                            className="p-1 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {editingCommentId === c.commentId ? (
                                                <div className="relative mt-2">
                                                    <textarea
                                                        className="w-full bg-white/5 border border-primary/30 rounded-xl p-3 text-sm text-white outline-none focus:ring-1 focus:ring-primary h-20"
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                    />
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <button onClick={() => setEditingCommentId(null)} className="text-xs text-outline hover:text-white">Cancel</button>
                                                        <button
                                                            onClick={() => handleSaveEdit(c.commentId)}
                                                            className="bg-primary text-black px-3 py-1 rounded-lg text-xs font-black uppercase"
                                                        >Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-on-surface/70 text-sm bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 break-words">
                                                    {c.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Field */}
                        <div className="relative">
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary outline-none transition-all pr-14"
                                placeholder="Share your thoughts..."
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                            />
                            <button
                                onClick={handleSendComment}
                                disabled={isAddingComment || !newComment.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all disabled:opacity-30"
                            >
                                {isAddingComment ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white hover:scale-110 transition-transform z-[70] border border-white/10"
                >
                    <X size={24} />
                </button>
            </motion.div>
        </motion.div>
    );
};
