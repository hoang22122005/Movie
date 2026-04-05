import { Search, Bell, Settings, Home, Film, Bookmark, User, ShieldCheck, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const [searchValue, setSearchValue] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    const isHeroPage = location.pathname === "/user" || location.pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // 1. Kiểm tra trạng thái scrolled để đổi màu nền (Glassmorphism)
            setScrolled(currentScrollY > 30);

            // 2. Logic ẩn/hiện Navbar thông minh
            if (currentScrollY <= 10) {
                // Luôn hiện khi ở đầu trang
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY.current) {
                // Kéo xuống -> Ẩn (hơn 50px mới bắt đầu ẩn để tránh nhạy quá mức)
                if (currentScrollY > 100) setIsVisible(false);
            } else {
                // Kéo lên -> Hiện
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchValue.trim()) {
            navigate(`/browse?q=${encodeURIComponent(searchValue.trim())}`);
            setSearchValue("");
        }
    };

    const handleLogout = () => {
        auth.logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: Home, label: 'Trang chủ', path: '/user' },
        { icon: Film, label: 'Phim', path: '/browse' },
        { icon: Bookmark, label: 'Yêu thích', path: '/watchlist' },
        { icon: User, label: 'Hồ sơ', path: '/profile' },
    ];

    if (auth.user?.role === 'ADMIN') {
        menuItems.push({ icon: ShieldCheck, label: 'Quản trị', path: '/admin' });
    }

    return (
        <header
            className={`fixed top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-[1400px] z-[100] flex justify-between items-center px-8 h-18 rounded-3xl transition-all duration-500 ease-in-out ${scrolled || !isHeroPage
                ? 'bg-surface/85 backdrop-blur-3xl border border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
                : 'bg-transparent border border-transparent'
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-24 pointer-events-none'
                }`}
        >
            {/* Logo - Increased to text-3xl for more impact */}
            <Link to="/user" className="text-3xl font-black text-primary italic tracking-tighter hover:scale-105 transition-transform flex-shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                Aether<span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] pl-1"> Cinema</span>
            </Link>

            {/* Navigation Buttons */}
            <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md overflow-hidden">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${isActive
                                ? 'bg-primary text-primary-dark shadow-[0_10px_25px_rgba(212,168,83,0.3)] scale-105'
                                : 'text-neutral-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <item.icon size={16} fill={isActive ? "currentColor" : "none"} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Actions Bar */}
            <div className="flex items-center gap-4">
                <div className="relative group hidden xl:block">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleSearch}
                        className="bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-xs w-28 focus:w-60 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all text-white outline-none duration-500"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary transition-colors" size={14} />
                </div>

                <div className="flex gap-1.5">
                    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-neutral-400 hover:text-primary transition-all flex items-center justify-center">
                        <Bell size={20} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/10 text-neutral-500 hover:text-white hover:bg-red-500 transition-all flex items-center justify-center grayscale hover:grayscale-0"
                        title="Đăng xuất"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                {/* Profile */}
                <div
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-all">
                        <img
                            src={auth.user?.urlAvt || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user?.username || 'Hoang'}`}
                            alt="Profile"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
