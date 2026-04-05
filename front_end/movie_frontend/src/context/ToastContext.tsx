import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
//lấy thông báo message rồi trả ra dòng thông báo xanh xanh ở góc phải bên dưới
type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, x: 20 }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[320px]
                ${t.type === 'success' ? 'bg-primary/10 border-primary/20 text-primary' :
                                    t.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                        'bg-white/5 border-white/10 text-white'}
              `}>
                                <div className="flex-shrink-0">
                                    {t.type === 'success' && <CheckCircle2 size={24} />}
                                    {t.type === 'error' && <AlertCircle size={24} />}
                                    {t.type === 'info' && <Info size={24} />}
                                </div>
                                <div className="flex-1 font-bold text-sm tracking-tight uppercase">
                                    {t.message}
                                </div>
                                <button
                                    onClick={() => removeToast(t.id)}
                                    className="opacity-40 hover:opacity-100 transition-opacity"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
};
