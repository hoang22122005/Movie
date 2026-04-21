import React, { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { UserDTO, JwtResponse, ApiResponse } from "../types";
import api from "../api";

interface AuthContextType {
    user: UserDTO | null;
    isAdmin: boolean;
    //khi gọi hàm này bắt buộc phải truyền vào là JwtReponse
    login: (data: JwtResponse) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (newUser: UserDTO) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const isAdmin = user?.role === "ADMIN";

    const initAuth = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const res = await api.get<ApiResponse<UserDTO>>(`/users/profile`);
                if (res.data.success) {
                    setUser(res.data.data);
                }
            } catch (err) {
                localStorage.removeItem("token");
                setUser(null);
            }
        }
        setIsLoading(false);
    };
    // [] chỉ chạy 1 lần khi khởi tạo web
    // nếu truyền vào thêm 1 từ khoá hay biến khi từ khoá hay biến đó thay đổi thì useeffect sẽ chạy lại
    useEffect(() => {
        initAuth();
    }, []);

    const login = async (data: JwtResponse) => {
        localStorage.setItem("token", data.token);
        queryClient.clear(); // Xoá sạch bộ nhớ đệm của tài khoản cũ
        setIsLoading(true);
        try {
            const res = await api.get<ApiResponse<UserDTO>>('/users/profile');

            if (res.data.success) {
                setUser(res.data.data);
            }
        } catch (err) {
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };
    const logout = async () => {
        localStorage.removeItem("token");
        queryClient.clear(); // Xoá sạch bộ nhớ đệm
        setUser(null);
    }

    const updateUser = (newUser: UserDTO) => {
        setUser(newUser);
    }

    return (
        <AuthContext.Provider value={{ user, isAdmin, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
//hàm xuất dữ liệu quy ước phải đặt trong AuthProvider thì mới lấy được dữ liệu ví trong main.tsx
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
