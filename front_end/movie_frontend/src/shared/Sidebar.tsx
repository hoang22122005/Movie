import { Home, Film, Bookmark, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/user' },
    { icon: Film, label: 'Movies', path: '/browse' },
    { icon: Bookmark, label: 'Watchlist', path: '/watchlist' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  if (auth.user?.role === 'ADMIN') {
    menuItems.push({ icon: ShieldCheck, label: 'Admin', path: '/admin' });
  }

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-surface/60 backdrop-blur-3xl flex flex-col pt-24 pb-10 shadow-[10px_0_30px_rgba(0,0,0,0.3)] hidden md:flex border-r border-white/5">
      <div className="px-8 mb-12">
        <div className="flex items-center gap-3">
          <img
            src="https://picsum.photos/seed/user1/100/100"
            alt="User"
            className="w-10 h-10 rounded-full object-cover border border-primary/20"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="text-white font-bold text-sm leading-none">{auth.user?.username || 'Guest'}</p>
            <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">{auth.user?.role || 'Member'}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 py-4 px-8 transition-all duration-300 ${isActive
                ? 'text-primary bg-primary/10 border-l-[3px] border-primary shadow-[0_0_20px_rgba(212,168,83,0.15)]'
                : 'text-neutral-500 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon size={20} fill={isActive ? "currentColor" : "none"} />
              <span className="font-sans text-sm tracking-wide uppercase font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut size={14} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
