import { Play, Eye, Star, Crown } from 'lucide-react';

interface MovieCardProps {
    key?: string | number;
    image: string;
    title: string;
    genre: string;
    year: string;
    views?: number | string;
    rating?: number | string;
    isVip?: boolean;
    onClick?: () => void;
}

export default function MovieCard({ image, title, genre, year, views, rating, isVip, onClick }: MovieCardProps) {
    return (
        <div
            onClick={onClick}
            className="group cursor-pointer w-full"
        >
            <div className="relative aspect-[2/3] bg-surface-light rounded-2xl overflow-hidden transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(212,168,83,0.1)] mb-4">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* VIP Badge */}
                {isVip && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-[9px] uppercase tracking-widest shadow-lg shadow-amber-500/40">
                        <Crown size={10} fill="currentColor" />
                        <span>VIP</span>
                    </div>
                )}

                {/* VIP Lock Overlay */}
                {isVip && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                            <Crown size={20} className="text-amber-400" fill="currentColor" />
                        </div>
                    </div>
                )}

                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    {!isVip && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-amber-400 font-black text-[10px]">
                            <Star size={12} fill="currentColor" />
                            <span>{rating || "0.0"}</span>
                        </div>
                    )}
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md border border-white/20 ${isVip ? 'bg-amber-500 text-black' : 'bg-primary text-primary-dark'}`}>
                        {isVip ? <Crown size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </div>
                </div>
            </div>

            <div className="px-1">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight flex-1">
                        {title}
                    </h4>
                    {isVip && (
                        <span className="flex-shrink-0 flex items-center gap-0.5 text-amber-400 text-[9px] font-black uppercase">
                            <Crown size={9} fill="currentColor" />
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                        {genre?.split(',')[0] || 'N/A'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span className="text-primary/70 text-[10px] font-bold">
                        {year}
                    </span>
                    {views !== undefined && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-neutral-700" />
                            <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-bold">
                                <Eye size={10} />
                                <span>{views}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
