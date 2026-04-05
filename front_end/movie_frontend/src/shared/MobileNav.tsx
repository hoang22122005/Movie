import { Home, Film, Bookmark, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileNav() {
    const location = useLocation();

    const items = [
        { icon: Home, label: 'Home', path: '/user' },
        { icon: Film, label: 'Phim', path: '/browse' },
        { icon: Bookmark, label: 'Yêu thích', path: '/watchlist' },
        { icon: User, label: 'Hồ sơ', path: '/profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full h-20 bg-surface/85 backdrop-blur-3xl lg:hidden flex justify-around items-center z-[100] border-t border-white/5 pb-2">
            {items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.label}
                        to={item.path}
                        className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative px-4 ${isActive ? 'text-primary' : 'text-neutral-500'
                            }`}
                    >
                        {/* Thanh chỉ báo active ở phía trên icon */}
                        {isActive && (
                            <div className="absolute -top-[12px] w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(212,168,83,0.5)]" />
                        )}

                        <item.icon
                            size={22}
                            fill={isActive ? "currentColor" : "none"}
                            className={`transition-transform ${isActive ? 'scale-110' : ''}`}
                        />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
