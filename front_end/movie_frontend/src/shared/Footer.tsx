import { Globe, Twitter, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#0e0e10] py-16 px-8 md:px-16 border-t border-white/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
                <div>
                    <h6 className="text-primary font-black italic tracking-tighter text-xl mb-6">Aether Cinema</h6>
                    <p className="text-xs text-neutral-400 leading-relaxed">The ultimate destination for premium storytelling and cinematic immersion.</p>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm mb-6 block uppercase tracking-widest">Platform</h4>
                    <ul className="space-y-3 text-xs text-neutral-400">
                        <li><a className="hover:text-primary transition-colors" href="#">Browse Movies</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">Watchlist</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">Devices</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">Subscription</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm mb-6 block uppercase tracking-widest">Support</h4>
                    <ul className="space-y-3 text-xs text-neutral-400">
                        <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">Account & Billing</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                        <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm mb-6 block uppercase tracking-widest">Connect</h4>
                    <div className="flex gap-4">
                        {[Globe, Twitter, Mail].map((Icon, i) => (
                            <div key={i} className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer group">
                                <Icon size={16} className="text-neutral-400 group-hover:text-primary" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] text-neutral-600 uppercase tracking-[0.2em]">© 2024 AETHER CINEMA ENTERTAINMENT. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-6 opacity-30 grayscale brightness-200">
                    <img src="https://picsum.photos/seed/logo1/100/30" alt="Partner" className="h-6" referrerPolicy="no-referrer" />
                    <img src="https://picsum.photos/seed/logo2/100/30" alt="Partner" className="h-6" referrerPolicy="no-referrer" />
                </div>
            </div>
        </footer>
    );
}
