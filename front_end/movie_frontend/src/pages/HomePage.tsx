import Hero from "../features/movies/components/Hero";
import { usePublicMovies } from "../features/movies/hooks/useMovies";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

export default function HomePage() {
    const { data: moviesData, isLoading, error } = usePublicMovies({ page: 0, size: 1 });
    const featured = moviesData?.content[0];
    const navigate = useNavigate();
    const auth = useAuth();
    const handleLogout = () => {
        auth.logout();
        navigate('/login');
    };
    return (
        <div>
            <Hero movie={featured} isLoading={isLoading} error={error?.message} />
            <div className="mx-auto max-w-5xl px-6 py-10">
                <h1 className="text-3xl font-black tracking-tight">Home</h1>
                <p className="mt-2 text-outline">Public page. Add your content here.</p>
            </div>
            <div className="px-6 mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                    <LogOut size={14} />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}
