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
                toast("Khởi tạo thanh toán thất bại", "error");
            }
        } catch (error) {
            console.error(error);
            toast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        "Nội dung UHD 4K đặc sắc",
        "Xem không giới hạn, không quảng cáo",
        "Ưu tiên xem trước các phim mới",
        "Khám phá tính năng đặc quyền VIP",
        "Ủng hộ đội ngũ phát triển"
    ];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30 py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-pulse">
                        <Crown className="text-primary" size={40} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">
                        Nâng cấp <span className="text-primary">VIP</span>
                    </h1>
                    <p className="text-neutral-500 text-lg max-w-xl mx-auto italic">
                        Trải nghiệm điện ảnh đỉnh cao đang chờ đón. Mở khóa kho tàng phim đặc sắc và tận hưởng sự khác biệt.
                    </p>
                </header>

                <div className="grid md:grid-cols-5 gap-8 bg-surface-light/30 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                    <div className="md:col-span-3 p-10 md:p-16 border-r border-white/5">
                        <h2 className="text-2xl font-bold uppercase tracking-widest mb-10 flex items-center gap-3">
                            <Star className="text-primary fill-primary" size={20} /> Quyền lợi Đặc quyền
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
                                <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-1">Giao dịch an toàn</h4>
                                <p className="text-neutral-500 text-xs">Phát triển bởi VNPay - Cổng thanh toán hàng đầu Việt Nam</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 p-10 md:p-16 bg-primary/5 flex flex-col justify-center text-center">
                        <div className="mb-10">
                            <span className="text-neutral-400 text-sm font-black uppercase tracking-[0.3em]">Gói hàng tháng</span>
                            <div className="flex items-center justify-center gap-1 mt-4">
                                <span className="text-5xl font-black italic">50,000</span>
                                <span className="text-2xl font-bold text-primary">VNĐ</span>
                            </div>
                            <p className="text-neutral-500 text-xs mt-4">Gia hạn mỗi 30 ngày. Hủy bất kỳ lúc nào.</p>
                        </div>

                        <button
                            onClick={handleSubscribe}
                            disabled={isLoading}
                            className="w-full py-6 glossy-gradient text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <Rocket size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                    Kích hoạt VIP ngay
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="mt-6 text-neutral-600 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                        >
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
