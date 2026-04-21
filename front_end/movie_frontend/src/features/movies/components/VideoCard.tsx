import { PlayCircle, Eye, Crown } from 'lucide-react';

interface VideoCardProps {
    key?: string | number;
    image: string;
    title: string;
    metadata: string;
    rating: string;
    badge: string;
    isVip?: boolean; // Thêm prop isVip
    views?: number | string;
    onClick?: () => void;
}

export default function VideoCard({ image, title, metadata, rating, badge, isVip, views, onClick }: VideoCardProps) {
    return (
        <div className="group cursor-pointer" onClick={onClick}>
            <div className="aspect-video bg-surface-light rounded-xl overflow-hidden mb-4 relative">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                />

                {/* VIP Badge for VideoCard */}
                {isVip && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-500/30">
                        <Crown size={12} fill="currentColor" />
                        <span>VIP</span>
                    </div>
                )}

                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    {badge}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isVip ? (
                        <Crown size={48} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                    ) : (
                        <PlayCircle size={48} className="text-white" />
                    )}
                </div>
            </div>
            <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <h5 className="font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                        {title}
                        {isVip && <Crown size={14} className="text-amber-500 shrink-0" fill="currentColor" />}
                    </h5>
                    <p className="text-neutral-400 text-xs">{metadata}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-amber-400 font-bold text-xs shrink-0">★ {rating}</span>
                    {views !== undefined && (
                        <div className="flex items-center gap-1 text-neutral-500 text-[10px] font-bold">
                            <Eye size={10} />
                            <span>{views} views</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
