import AuthForm from "../features/auth/components/AuthForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center overflow-hidden relative bg-surface">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"></div>
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')" }}
                ></div>
                <div className="absolute inset-0 bg-glow"></div>
            </div>

            <main className="relative z-10 w-full max-w-md px-6 py-12">
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black tracking-tighter text-primary uppercase mb-2">
                        Aether Cinema
                    </h1>
                    <p className="text-outline text-xs tracking-[0.3em] uppercase font-medium">
                        Digital Cinema Experience
                    </p>
                </div>

                {/* Feature Component */}
                <AuthForm />

                {/* Secondary Actions */}
                <div className="mt-8 flex justify-center gap-6">
                    <button className="flex items-center gap-2 text-outline hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                        Support
                    </button>
                    <div className="w-px h-4 bg-white/10"></div>
                    <button className="flex items-center gap-2 text-outline hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                        English
                    </button>
                </div>
            </main>

            {/* Decorative Cinematic Elements */}
            <div className="fixed bottom-12 left-12 z-10 hidden lg:block opacity-40">
                <div className="flex flex-col gap-1">
                    <div className="h-[2px] w-24 bg-primary/30"></div>
                    <div className="h-[2px] w-16 bg-primary/20"></div>
                    <div className="h-[2px] w-32 bg-primary/10"></div>
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary mt-4">System Online</p>
            </div>
        </div>
    );
}
