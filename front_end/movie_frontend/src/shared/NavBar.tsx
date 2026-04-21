import { Search, Bell, Home, Film, Bookmark, User, ShieldCheck, LogOut, Crown } from 'lucide-react';
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
            className={`fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 md:px-12 h-20 transition-all duration-500 ${scrolled || !isHeroPage
                ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl'
                : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
                } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
        >
            {/* Logo */}
            <Link to="/user" className="flex items-center gap-2 group italic">
                <span className="text-2xl font-black tracking-tighter text-primary">AETHER</span>
                <span className="text-2xl font-light tracking-tighter text-white/90">CINEMA</span>
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-2 px-4 h-11 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={16} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Actions Bar - Perfect Alignment */}
            <div className="flex items-center gap-3">
                {/* VIP Status/Button */}
                {auth.user?.isVip ? (
                    <div className="hidden md:flex items-center gap-2 px-5 h-11 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-yellow-500/30 text-yellow-500 font-black uppercase text-[11px] tracking-widest shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                        <Crown size={14} fill="currentColor" className="animate-pulse" />
                        ROYAL VIP
                    </div>
                ) : (
                    <button
                        onClick={() => navigate("/vip-upgrade")}
                        className="hidden md:flex items-center gap-2 px-5 h-11 rounded-xl bg-primary text-black font-bold uppercase text-[11px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,168,83,0.3)]"
                    >
                        <Crown size={14} fill="currentColor" />
                        NÂNG CẤP VIP
                    </button>
                )}

                {/* Search Bar */}
                <div className="relative group hidden lg:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleSearch}
                        className="bg-white/5 border border-white/10 rounded-xl h-11 pl-11 pr-4 text-xs w-40 focus:w-56 focus:border-primary/50 transition-all text-white outline-none"
                    />
                </div>

                {/* Notification & Logout */}
                <div className="flex items-center gap-2">
                    <button className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-primary hover:bg-white/10 transition-all flex items-center justify-center">
                        <Bell size={18} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                {/* Profile Avatar */}
                <button
                    onClick={() => navigate("/profile")}
                    className="w-11 h-11 rounded-xl border border-white/10 overflow-hidden hover:border-primary/50 transition-all p-0.5 bg-white/5"
                >
                    <img
                        src={auth.user?.urlAvt || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user?.username || 'Hoang'}`}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                    />
                </button>
            </div>
        </header>
    );
}
