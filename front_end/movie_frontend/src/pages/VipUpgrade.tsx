import { Crown, Check, Shield, Star, Rocket, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useToast } from "../context/ToastContext";

export default function VipUpgrade() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/payment/create-vip-payment");
            if (response.data.success && response.data.data) {
                // Redirect to VNPay
                window.location.href = response.data.data;
            } else {
                toast("Failed to initiate payment", "error");
            }
        } catch (error) {
            console.error(error);
            toast("An error occurred. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        "Access to UHD 4K Cinematic Content",
        "Unlimited Streaming without Interruptions",
        "Early Access to New Releases",
        "Exclusive VIP-only Feature Discovery",
        "Support the Obsidian Stage Evolution"
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-pulse">
                        <Crown className="text-primary" size={40} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">
                        Ascend to <span className="text-primary">VIP</span>
                    </h1>
                    <p className="text-neutral-500 text-lg max-w-xl mx-auto italic">
                        The ultimate cinematic experience awaits. Unlock the obsidian vault and witness excellence.
                    </p>
                </header>

                <div className="grid md:grid-cols-5 gap-8 bg-surface-light/30 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                    <div className="md:col-span-3 p-10 md:p-16 border-r border-white/5">
                        <h2 className="text-2xl font-bold uppercase tracking-widest mb-10 flex items-center gap-3">
                            <Star className="text-primary fill-primary" size={20} /> Prestige Benefits
                        </h2>
                        <ul className="space-y-6">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="text-primary" size={14} />
                                    </div>
                                    <span className="text-neutral-300 font-medium italic">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-16 flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                            <Shield className="text-emerald-500" size={32} />
                            <div>
                                <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-1">Secure Transaction</h4>
                                <p className="text-neutral-500 text-xs">Powered by VNPay - Vietnam's Leading Payment Gateway</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 p-10 md:p-16 bg-primary/5 flex flex-col justify-center text-center">
                        <div className="mb-10">
                            <span className="text-neutral-400 text-sm font-black uppercase tracking-[0.3em]">Monthly Access</span>
                            <div className="flex items-center justify-center gap-1 mt-4">
                                <span className="text-5xl font-black italic">50,000</span>
                                <span className="text-2xl font-bold text-primary">VND</span>
                            </div>
                            <p className="text-neutral-500 text-xs mt-4">Renews every 30 days. Cancel anytime.</p>
                        </div>

                        <button
                            onClick={handleSubscribe}
                            disabled={isLoading}
                            className="w-full py-6 glossy-gradient text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <Rocket size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                    Initialize VIP
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="mt-6 text-neutral-600 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                        >
                            Back to Gallery
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
