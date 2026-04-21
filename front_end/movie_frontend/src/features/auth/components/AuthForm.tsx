declare global {
    interface Window {
        google: any;
    }
}

import { useEffect, useRef } from "react";
import { useAuthForm } from "../hooks/useAuthForm";
import { useToast } from "../../../context/ToastContext";
import { useGoogleLogin } from "../hooks/useAuth";

// !!! USER: Replace this with your Actual Google Client ID from Google Cloud Console !!!
const GOOGLE_CLIENT_ID = "236061701239-b4kr09c84j1qdhkakprucvcr28cblaje.apps.googleusercontent.com";

export default function AuthForm() {
    const { toast } = useToast();
    const googleBtnRef = useRef<HTMLDivElement>(null);
    const {
        mutate: googleLogin,
        isPending: isGoogleSubmitting
    } = useGoogleLogin();

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

    useEffect(() => {
        const initializeGoogle = () => {
            if (window.google && googleBtnRef.current) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (response: any) => {
                        toast("Xác nhận Google thành công. Đang vào rạp phim...", "success");
                        googleLogin(response.credential);
                    },
                });

                window.google.accounts.id.renderButton(googleBtnRef.current, {
                    theme: "filled_black",
                    size: "large",
                    shape: "pill",
                    width: googleBtnRef.current.offsetWidth,
                });
            }
        };

        // Retry if script not loaded yet
        const interval = setInterval(() => {
            if (window.google) {
                initializeGoogle();
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [googleLogin, toast]);

    return (
        <div className="glass-card p-10 rounded-2xl relative overflow-hidden">
            {/* Micro-border highlight */}
            <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-2xl"></div>

            <header className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">
                    {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản"}
                </h2>
                <p className="text-outline text-sm">
                    {isLogin ? "Vui lòng nhập thông tin để đăng nhập." : "Gia nhập cộng đồng xem phim ngay hôm nay."}
                </p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Identity Input */}
                <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 ml-1">
                        TÊN ĐĂNG NHẬP
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleInputChange(e, "username")}
                            className="w-full bg-surface-container/50 border border-white/10 rounded-xl py-3.5 pl-4 pr-4 text-white placeholder:text-outline/50 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
                            placeholder="Email hoặc Tên đăng nhập"
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
                                placeholder="Địa chỉ email"
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Password Input */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                            MẬT KHẨU
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
                    disabled={isSubmitting || isGoogleSubmitting}
                    className="w-full py-4 rounded-xl glossy-gradient text-surface font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isSubmitting || isGoogleSubmitting ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Khởi tạo tài khoản"}
                </button>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest"><span className="bg-surface px-4 text-outline/50">HOẶC TIẾP TỤC VỚI</span></div>
                </div>

                <div className="w-full flex justify-center" ref={googleBtnRef}></div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-outline text-sm">
                    {isLogin ? "Bạn mới tham gia?" : "Đã có tài khoản?"}
                    <button
                        onClick={toggleMode}
                        className="text-white font-bold ml-1 hover:text-primary transition-colors cursor-pointer"
                    >
                        {isLogin ? "Tạo tài khoản" : "Đăng nhập"}
                    </button>
                </p>
            </div>
        </div>
    );
}
