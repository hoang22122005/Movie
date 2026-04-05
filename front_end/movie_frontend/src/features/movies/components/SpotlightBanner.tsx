import { Star } from 'lucide-react';

export default function SpotlightBanner() {
    return (
        <section className="px-8 md:px-16 mb-16">
            <div className="relative h-64 w-full rounded-2xl overflow-hidden group">
                <img
                    src="https://picsum.photos/seed/cinema/1200/400"
                    alt="Spotlight"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent flex flex-col justify-center px-12">
                    <div className="flex items-center gap-2 mb-2">
                        <Star size={14} className="text-primary fill-primary" />
                        <span className="text-primary font-bold text-xs tracking-widest uppercase">Weekly Spotlight</span>
                    </div>
                    <h4 className="text-4xl font-bold text-white mb-2">The Director's Cut</h4>
                    <p className="text-neutral-400 max-w-md text-sm mb-6">Exclusive interviews and behind-the-scenes look at this year's most anticipated blockbusters.</p>
                    <button className="w-fit px-6 py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-primary transition-colors">Watch Now</button>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
            </div>
        </section>
    );
}
