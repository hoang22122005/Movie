import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

export default function PaymentCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
    const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...");

    useEffect(() => {
        // Backend đã validate và redirect về đây với ?status=success hoặc ?status=failed
        const paymentStatus = searchParams.get("status");
        const code = searchParams.get("code");

        if (paymentStatus === "success") {
            setStatus("success");
            setMessage("Giao dịch thành công! Bạn đã được nâng cấp lên gói VIP 30 ngày.");
        } else if (paymentStatus === "failed") {
            setStatus("failed");
            const errorMsg = code === "24"
                ? "Bạn đã hủy giao dịch."
                : `Giao dịch thất bại (Mã lỗi: ${code || "unknown"}).`;
            setMessage(errorMsg);
        } else {
            // Không có status param → truy cập trực tiếp trang này
            setStatus("failed");
            setMessage("Không tìm thấy thông tin giao dịch.");
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
            <div className="bg-surface-light/30 border border-white/5 backdrop-blur-3xl p-10 md:p-16 rounded-[2.5rem] max-w-xl w-full text-center shadow-2xl">
                {status === "loading" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                                <Loader2 className="animate-spin text-primary relative" size={64} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold uppercase tracking-widest italic">Đang xác thực</h2>
                        <p className="text-neutral-400 italic">{message}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                                <CheckCircle2 className="text-emerald-500 relative" size={80} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-emerald-400">Thanh toán thành công</h2>
                        <p className="text-neutral-300 font-medium">{message}</p>
                        <div className="pt-6">
                            <button
                                onClick={() => navigate("/user")}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group"
                            >
                                Trải nghiệm VIP ngay <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                {status === "failed" && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
                                <XCircle className="text-red-500 relative" size={80} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-400">Thanh toán thất bại</h2>
                        <p className="text-neutral-300 font-medium">{message}</p>
                        <div className="pt-6 space-y-4">
                            <button
                                onClick={() => navigate("/vip-upgrade")}
                                className="w-full py-4 glossy-gradient text-black font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="w-full py-4 text-neutral-500 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors"
                            >
                                Quay về trang chủ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
