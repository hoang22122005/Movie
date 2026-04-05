import { Play } from 'lucide-react';

interface MovieCardProps {
    key?: string | number;
    image: string;
    title: string;
    genre: string;
    year: string;
    onClick?: () => void;
}

export default function MovieCard({ image, title, genre, year, onClick }: MovieCardProps) {
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
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-dark flex items-center justify-center shadow-xl backdrop-blur-md border border-white/20">
                        <Play size={18} fill="currentColor" />
                    </div>
                </div>
            </div>

            <div className="px-1">
                <h4 className="text-white font-bold text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">
                    {title}
                </h4>
                <div className="flex items-center gap-2">
                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                        {genre?.split(',')[0] || 'N/A'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span className="text-primary/70 text-[10px] font-bold">
                        {year}
                    </span>
                </div>
            </div>
        </div>
    );
}
