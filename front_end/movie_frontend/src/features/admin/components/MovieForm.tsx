import React, { useState, useEffect } from "react";
import type { MovieResponse } from "../../../types";
import { X } from "lucide-react";

interface MovieFormProps {
    movie?: MovieResponse | null;
    onSubmit: (data: Partial<MovieResponse>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const MovieForm: React.FC<MovieFormProps> = ({ movie, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<Partial<MovieResponse>>({
        title: "",
        description: "",
        director: "",
        duration: 0,
        releaseDate: "",
        posterUrl: "",
        trailerUrl: "",
        genresId: [],
    });

    useEffect(() => {
        if (movie) {
            setFormData({
                ...movie,
            });
        }
    }, [movie]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "duration" ? parseInt(value) || 0 : value,
        }));
    };

    const handleGenresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const genresId = value.split(",").map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
        setFormData((prev) => ({ ...prev, genresId }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-[#141414] border border-white/10 p-8 shadow-2xl relative">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-6 h-6 text-white/50 hover:text-white" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-cyan-400 rounded-full" />
                    {movie ? "Edit Movie" : "Add New Movie"}
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Movie Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                            placeholder="Interstellar"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Director</label>
                        <input
                            type="text"
                            name="director"
                            value={formData.director}
                            onChange={handleChange}
                            className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                            placeholder="Christopher Nolan"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-all resize-none"
                            placeholder="Movie description..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Duration (min)</label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Release Date</label>
                        <input
                            type="date"
                            name="releaseDate"
                            value={formData.releaseDate}
                            onChange={handleChange}
                            className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-400">Genres IDs (comma separated)</label>
                        <input
                            type="text"
                            value={formData.genresId?.join(", ") || ""}
                            onChange={handleGenresChange}
                            className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                            placeholder="1, 2, 3"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-400">Poster URL</label>
                        <input
                            type="text"
                            name="posterUrl"
                            value={formData.posterUrl}
                            onChange={handleChange}
                            className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-400">Trailer URL (YouTube)</label>
                        <input
                            type="text"
                            name="trailerUrl"
                            value={formData.trailerUrl}
                            onChange={handleChange}
                            className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-all"
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                        >
                            {isLoading ? "Saving..." : movie ? "Update Movie" : "Add Movie"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MovieForm;
