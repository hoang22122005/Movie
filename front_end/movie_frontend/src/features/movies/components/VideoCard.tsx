import { PlayCircle } from 'lucide-react';

interface VideoCardProps {
    key?: string | number;
    image: string;
    title: string;
    metadata: string;
    rating: string;
    badge: string;
    onClick?: () => void;
}

export default function VideoCard({ image, title, metadata, rating, badge, onClick }: VideoCardProps) {
    return (
        <div className="group cursor-pointer" onClick={onClick}>
            <div className="aspect-video bg-surface-light rounded-xl overflow-hidden mb-4 relative">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    {badge}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle size={48} className="text-white" />
                </div>
            </div>
            <div className="flex justify-between items-start">
                <div>
                    <h5 className="font-bold text-white group-hover:text-primary transition-colors">{title}</h5>
                    <p className="text-neutral-400 text-xs">{metadata}</p>
                </div>
                <div className="text-right">
                    <span className="text-amber-400 font-bold text-xs">IMDb {rating}</span>
                </div>
            </div>
        </div>
    );
}
