import { useState, useEffect } from "react";
import { User as UserIcon, Mail, Shield, Loader2, LogOut, Camera, Settings, Bell, CreditCard, Briefcase, Users, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useProfile, useUpdateProfile, useChangePassword } from "../features/user-profile/hooks/useUser";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
    const { toast } = useToast();
    const { logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Profile Data
    const { data: profile, isLoading } = useProfile();

    // Form states
    const [profileAge, setProfileAge] = useState<number>(0);
    const [profileEmail, setProfileEmail] = useState("");
    const [profileGender, setProfileGender] = useState("");
    const [profileOccupation, setProfileOccupation] = useState("");
    const [profileAvatar, setProfileAvatar] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Initialize form when data loaded
    useEffect(() => {
        if (profile) {
            setProfileAge(profile.age || 0);
            setProfileEmail(profile.email);
            setProfileGender(profile.gender || "");
            setProfileOccupation(profile.occupation || "");
            setProfileAvatar(profile.urlAvt || "");
        }
    }, [profile]);

    // Mutations
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();

    // Callbacks for mutations
    const handleUpdateProfile = (data: any) => {
        updateProfileMutation.mutate(data, {
            onSuccess: (response) => {
                const newUser = response.data.data;
                updateUser(newUser);
                toast("Identity synchronized", "success");
                setShowEditModal(false);
            },
            onError: () => toast("Sync failed", "error")
        });
    };

    const handleChangePassword = (data: any) => {
        changePasswordMutation.mutate(data, {
            onSuccess: () => {
                toast("Protocol updated", "success");
                setShowPasswordModal(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            },
            onError: (err: any) => toast(err?.response?.data?.message || "Protocol mismatch", "error")
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface overflow-x-hidden font-sans text-white">
            {/* Cinematic Header Background */}
            <div className="relative h-[40vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-surface"></div>
                <div className="absolute inset-0 backdrop-blur-[100px]"></div>
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.3 }}
                    className="absolute inset-0"
                >
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent"></div>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
                {/* Profile Card */}
                <div className="flex flex-col md:flex-row gap-10 items-end mb-16 px-4">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="relative group cursor-pointer"
                    >
                        <div className="w-40 h-40 md:w-56 md:h-56 rounded-[3rem] overflow-hidden border-4 border-surface shadow-[0_0_50px_rgba(212,168,83,0.3)] bg-surface-container">
                            <img
                                src={(profile?.urlAvt as string) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`}
                                className="w-full h-full object-cover"
                                alt="Profile"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[3rem]">
                            <Camera className="text-white" size={32} />
                        </div>
                    </motion.div>

                    <div className="flex-1 mb-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full">{profile?.role} Member</span>
                                <span className="text-outline text-[10px] uppercase tracking-[0.2em] font-bold">Identity Confirmed</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-6 leading-none">
                                {profile?.username}<span className="text-primary">.</span>
                            </h1>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                                >
                                    <Settings size={16} /> Edit Profile
                                </button>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                                >
                                    <Shield size={16} /> Security
                                </button>
                                <button
                                    onClick={() => { logout(); navigate("/login"); }}
                                    className="px-8 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-2"
                                >
                                    <LogOut size={16} /> Terminate
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Stats Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-primary/50 transition-colors"
                        >
                            <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em] mb-10">Consumption Hub</h3>
                            <div className="flex items-end gap-1">
                                <span className="text-7xl font-black italic leading-none">42</span>
                                <span className="text-xs font-bold text-primary uppercase pb-2">Movies Watched</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-primary/50 transition-colors"
                        >
                            <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em] mb-10">Critical Feedback</h3>
                            <div className="flex items-end gap-1">
                                <span className="text-7xl font-black italic leading-none">12</span>
                                <span className="text-xs font-bold text-primary uppercase pb-2">Comments Shared</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="md:col-span-2 p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em]">Personal Specs</h3>
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-outline uppercase font-bold tracking-widest">Email</p>
                                        <p className="text-sm font-bold truncate max-w-[120px]">{profile?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-outline uppercase font-bold tracking-widest">Gender</p>
                                        <p className="text-sm font-bold">{profile?.gender || "NA"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Briefcase size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-outline uppercase font-bold tracking-widest">Occupation</p>
                                        <p className="text-sm font-bold truncate max-w-[100px]">{profile?.occupation || "Unknown"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <UserIcon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-outline uppercase font-bold tracking-widest">Age</p>
                                        <p className="text-sm font-bold">{profile?.age || "0"}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-8">
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <Bell className="text-primary" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Notifications</h3>
                            </div>
                            <p className="text-sm text-neutral-400 leading-relaxed italic mb-6">"Your profile data has been successfully synchronized."</p>
                            <button className="w-full py-4 bg-primary/10 border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/20">View Alerts</button>
                        </motion.div>

                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <CreditCard className="text-neutral-500" />
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Member Tier</h3>
                            </div>
                            <p className="text-2xl font-black italic mb-2">ACCESS LEVEL <span className="text-primary">ULTRA</span></p>
                            <p className="text-[10px] text-outline uppercase font-bold tracking-widest">Status: Active</p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-surface-container rounded-[2.5rem] border border-white/10 p-10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                        >
                            <h3 className="text-2xl font-black uppercase italic text-white mb-8 flex items-center gap-3">
                                <Settings className="text-primary" size={24} />
                                Update Registry
                            </h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdateProfile({
                                        age: profileAge,
                                        email: profileEmail,
                                        gender: profileGender,
                                        occupation: profileOccupation,
                                        urlAvt: profileAvatar
                                    });
                                }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] text-outline uppercase font-bold tracking-widest pl-1">Chronological Age</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                                        <input
                                            type="number"
                                            value={profileAge}
                                            onChange={(e) => setProfileAge(Number(e.target.value))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-outline uppercase font-bold tracking-widest pl-1">Mail Protocol</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                                        <input
                                            type="email"
                                            value={profileEmail}
                                            onChange={(e) => setProfileEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-outline uppercase font-bold tracking-widest pl-1">Identity Gender</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                                        <select
                                            value={profileGender}
                                            onChange={(e) => setProfileGender(e.target.value)}
                                            className="w-full bg-surface border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:ring-1 focus:ring-primary appearance-none"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                            <option value="O">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-outline uppercase font-bold tracking-widest pl-1">Life Occupation</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                                        <input
                                            type="text"
                                            value={profileOccupation}
                                            placeholder="e.g. Designer"
                                            onChange={(e) => setProfileOccupation(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] text-outline uppercase font-bold tracking-widest pl-1">Avatar Resource Link</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                                        <input
                                            type="text"
                                            value={profileAvatar}
                                            placeholder="https://example.com/photo.jpg"
                                            onChange={(e) => setProfileAvatar(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4 md:col-span-2">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-white/5 text-xs font-black uppercase rounded-2xl">Cancel</button>
                                    <button type="submit" disabled={updateProfileMutation.isPending} className="flex-1 py-4 bg-primary text-black text-xs font-black uppercase rounded-2xl flex items-center justify-center gap-2">
                                        {updateProfileMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Synchronize"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-surface-container rounded-[2.5rem] border border-white/10 p-10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                        >
                            <h3 className="text-2xl font-black uppercase italic text-white mb-8 flex items-center gap-3">
                                <Shield className="text-primary" size={24} />
                                Security protocol
                            </h3>
                            <form onSubmit={(e) => { e.preventDefault(); if (newPassword !== confirmPassword) { toast("Mismatch!", "error"); return; } handleChangePassword({ oldPassword, newPassword }); }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-outline uppercase font-bold tracking-widest pl-1">Current Code</label>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-outline uppercase font-bold tracking-widest pl-1">New Code</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-outline uppercase font-bold tracking-widest pl-1">Confirm Code</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 bg-white/5 text-xs font-black uppercase rounded-2xl">Cancel</button>
                                    <button type="submit" disabled={changePasswordMutation.isPending} className="flex-1 py-4 bg-primary text-black text-xs font-black uppercase rounded-2xl flex items-center justify-center gap-2">
                                        {changePasswordMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Update"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
