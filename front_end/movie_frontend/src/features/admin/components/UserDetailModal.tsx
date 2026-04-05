import React from "react";
import type { UserDTO } from "../../../types";
import { X, User, Mail, Shield, Calendar, Briefcase } from "lucide-react";

interface UserDetailModalProps {
    user: UserDTO;
    onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#141414] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                >
                    <X className="w-6 h-6 text-white/50 hover:text-white" />
                </button>

                <div className="flex flex-col items-center mb-8 relative z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-1 mb-4 shadow-xl shadow-cyan-500/20">
                        <div className="w-full h-full rounded-full bg-[#141414] flex items-center justify-center">
                            <User className="w-12 h-12 text-cyan-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {user.role}
                    </span>
                </div>

                <div className="space-y-4 relative z-10">
                    <DetailItem icon={<Mail className="w-5 h-5" />} label="Email Address" value={user.email} />
                    <DetailItem icon={<Shield className="w-5 h-5" />} label="User ID" value={`#${user.userId}`} />
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem icon={<Calendar className="w-5 h-5" />} label="Age" value={user.age?.toString() || "N/A"} />
                        <DetailItem icon={<User className="w-5 h-5" />} label="Gender" value={user.gender || "N/A"} />
                    </div>
                    <DetailItem icon={<Briefcase className="w-5 h-5" />} label="Occupation" value={user.occupation || "N/A"} />
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all w-full"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0B0B0B] border border-white/5">
        <div className="p-2 rounded-lg bg-white/5 text-cyan-400">
            {icon}
        </div>
        <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-white font-medium">{value}</p>
        </div>
    </div>
);

export default UserDetailModal;
