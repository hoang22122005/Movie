// src/features/auth/components/AuthForm.tsx
import { useAuthForm } from "../hooks/useAuthForm";

export default function AuthForm() {
    const {
        isLogin,
        formData,
        isSubmitting,
        errorMessage,
        successMessage,
        handleInputChange,
        handleSubmit,
        toggleMode,
    } = useAuthForm();

    return (
        <div className="glass-card p-10 rounded-2xl relative overflow-hidden">
            {/* Micro-border highlight */}
            <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-2xl"></div>

            <header className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-outline text-sm">
                    {isLogin ? "Please enter your details to sign in." : "Join the obsidian stage today."}
                </p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Identity Input */}
                <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 ml-1">
                        USERNAME
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleInputChange(e, "username")}
                            className="w-full bg-surface-container/50 border border-white/10 rounded-xl py-3.5 pl-4 pr-4 text-white placeholder:text-outline/50 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
                            placeholder="Email or Username"
                            required
                        />
                    </div>
                </div>

                {!isLogin && (
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 ml-1">
                            Email
                        </label>
                        <div className="relative group">
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange(e, "email")}
                                className="w-full bg-surface-container/50 border border-white/10 rounded-xl py-3.5 pl-4 pr-4 text-white placeholder:text-outline/50 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
                                placeholder="Email address"
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Password Input */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                            PASSWORD
                        </label>
                    </div>
                    <div className="relative group">
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange(e, "password")}
                            className="w-full bg-surface-container/50 border border-white/10 rounded-xl py-3.5 pl-4 pr-4 text-white placeholder:text-outline/50 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {errorMessage ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                ) : null}
                {successMessage ? (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                        {successMessage}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl glossy-gradient text-surface font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isSubmitting ? "Processing..." : isLogin ? "Enter Cinema" : "Initialize Account"}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-outline text-sm">
                    {isLogin ? "New to the Obsidian Stage?" : "Already have access?"}
                    <button
                        onClick={toggleMode}
                        className="text-white font-bold ml-1 hover:text-primary transition-colors cursor-pointer"
                    >
                        {isLogin ? "Create Account" : "Sign In"}
                    </button>
                </p>
            </div>
        </div>
    );
}
