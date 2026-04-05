import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Calendar, Send, Loader2, Edit2, Trash2 } from "lucide-react";
import { useMovieDetail, useMovieComments } from "../features/movies/hooks/useMovieDetail";
import { useCommentActions } from "../features/movies/hooks/useMovieActions";
import { useRecommendations } from "../features/movies/hooks/useMovies";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { CommentDTO } from "../types";

export default function WatchPage() {
    const { movieId } = useParams<{ movieId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");

    const { data: movie, isLoading, error } = useMovieDetail(movieId || "");

    const { data: commentsData, isLoading: isCommentsLoading } = useMovieComments(movieId || "");
    const comments = commentsData?.content || [];

    const { postCommentMutation, updateCommentMutation, deleteCommentMutation } = useCommentActions(movieId || "");

    const isAddingComment = postCommentMutation.isPending;

    const { data: recommendations } = useRecommendations();

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        try {
            await postCommentMutation.mutateAsync({ content: newComment, movieId: Number(movieId) });
            setNewComment("");
            toast("Comment posted!", "success");
        } catch (err) {
            toast("Failed to post comment", "error");
        }
    };

    const handleSaveEdit = async (id: number) => {
        if (!editContent.trim()) return;
        try {
            await updateCommentMutation.mutateAsync({ commentId: id, content: editContent, movieId: Number(movieId) });
            setEditingId(null);
            toast("Comment updated!", "success");
        } catch (err) {
            toast("Failed to update", "error");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-bold animate-pulse uppercase tracking-[0.3em] text-xs">Loading Experience...</p>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-4xl font-black text-white mb-4 uppercase italic">Feature Not Found</h2>
                <button onClick={() => navigate(-1)} className="px-10 py-4 bg-primary text-black font-black rounded-2xl uppercase tracking-widest text-sm">Back</button>
            </div>
        );
    }

    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
        if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
        return url;
    };

    return (
        <div className="min-h-screen bg-surface overflow-x-hidden">
            <div className="relative w-full aspect-video md:h-[80vh] bg-black">
                <iframe
                    src={`${getEmbedUrl(movie.trailerUrl)}?autoplay=1&mute=0&rel=0`}
                    title={movie.title}
                    className="w-full h-full border-none"
                    allowFullScreen
                ></iframe>
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-8 left-8 w-14 h-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center hover:bg-primary transition-all z-10"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2">
                        <div className="flex flex-wrap items-center gap-4 mb-6 text-neutral-400 text-xs font-bold uppercase tracking-widest">
                            <span className="px-3 py-1 bg-primary text-primary-dark text-[10px] rounded-full">UHD 4K</span>
                            <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-yellow-500" /> 8.9</div>
                            <div className="flex items-center gap-1"><Clock size={14} /> {movie.duration}m</div>
                            <div className="flex items-center gap-1"><Calendar size={14} /> {movie.releaseDate?.split('-')[0]}</div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase mb-12 leading-[0.9]">
                            {movie.title}
                        </h1>

                        <div className="p-8 rounded-[2rem] bg-surface-light border border-white/5 backdrop-blur-md mb-20 italic font-light text-neutral-300 text-lg">
                            "{movie.description}"
                        </div>

                        <div className="border-t border-white/5 pt-12">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-10">Audience Reactions</h3>

                            {/* Input Field */}
                            <div className="relative mb-12">
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-primary outline-none transition-all pr-20"
                                    placeholder="Add your public reaction..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                />
                                <button
                                    onClick={handleSendComment}
                                    disabled={isAddingComment || !newComment.trim()}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all disabled:opacity-30"
                                >
                                    {isAddingComment ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                </button>
                            </div>

                            <div className="space-y-10">
                                {isCommentsLoading ? <Loader2 className="animate-spin mx-auto text-primary" /> : (
                                    comments.map((c: CommentDTO) => (
                                        <div key={c.commentId} className="flex gap-6 group">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black uppercase text-xs">
                                                {c.username ? c.username.substring(0, 2) : (c.userId % 100)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-white font-bold text-sm tracking-wide">{c.username || `User #${c.userId}`}</span>
                                                        <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                    </div>

                                                    {user?.userId === c.userId && (
                                                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => { setEditingId(c.commentId); setEditContent(c.content); }}
                                                                className="text-neutral-500 hover:text-primary p-1"
                                                            ><Edit2 size={16} /></button>
                                                            <button
                                                                onClick={async () => { if (window.confirm("Delete?")) await deleteCommentMutation.mutateAsync(c.commentId); }}
                                                                className="text-neutral-500 hover:text-red-500 p-1"
                                                            ><Trash2 size={16} /></button>
                                                        </div>
                                                    )}
                                                </div>

                                                {editingId === c.commentId ? (
                                                    <div className="mt-4 p-6 bg-white/5 rounded-2xl border border-primary/30">
                                                        <textarea
                                                            className="w-full bg-transparent text-white outline-none h-24 mb-4 resize-none"
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                        />
                                                        <div className="flex justify-end gap-3">
                                                            <button onClick={() => setEditingId(null)} className="text-xs text-neutral-500 hover:text-white uppercase font-black">Cancel</button>
                                                            <button onClick={() => handleSaveEdit(c.commentId)} className="bg-primary text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Update</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-neutral-400 text-sm bg-white/5 p-6 rounded-[1.5rem] rounded-tl-none border border-white/5 italic">
                                                        {c.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-white uppercase italic">Up Next</h3>
                        </div>
                        <div className="flex flex-col gap-8">
                            {recommendations?.slice(0, 4).map((recMovie) => (
                                <div key={recMovie.movieId} className="flex gap-4 group cursor-pointer" onClick={() => navigate(`/watch/${recMovie.movieId}`)}>
                                    <div className="w-24 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:scale-105 transition-transform">
                                        <img src={recMovie.posterUrl} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="py-2">
                                        <h4 className="text-white font-bold text-sm mb-1 group-hover:text-primary transition-colors uppercase tracking-tight line-clamp-1">{recMovie.title}</h4>
                                        <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">{recMovie.genres[0]}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
