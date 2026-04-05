interface GenreCardProps {
    image: string;
    label: string;
    color: string;
    onClick?: () => void;
}

export default function GenreCard({ image, label, color, onClick }: GenreCardProps) {
    return (
        <div
            onClick={onClick}
            className="relative h-32 rounded-2xl overflow-hidden group cursor-pointer border border-white/5 transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
        >
            <img
                src={image}
                alt={label}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
            />
            <div className={`absolute inset-0 ${color} backdrop-blur-[2px] flex items-center justify-center transition-all duration-300 group-hover:backdrop-blur-none`}>
                <span className="text-white font-black tracking-widest uppercase text-sm drop-shadow-lg group-hover:scale-110 transition-transform">{label}</span>
            </div>
        </div>
    );
}
