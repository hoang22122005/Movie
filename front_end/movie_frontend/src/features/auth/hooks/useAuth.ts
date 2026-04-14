import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuth } from "../../../context/AuthContext";

export function useLogin() {
    const auth = useAuth();

    return useMutation({
        mutationFn: async (data: any) => {
            const res = await authService.login(data);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
        onSuccess: async (data) => {
            localStorage.setItem("token", data.token);
            await auth.login(data);
        },
    });
}

export function useRegister() {
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await authService.register(data);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
    });
}

export function useGoogleLogin() {
    const auth = useAuth();

    return useMutation({
        mutationFn: async (idToken: string) => {
            const res = await authService.googleLogin(idToken);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
        onSuccess: async (data) => {
            localStorage.setItem("token", data.token);
            await auth.login(data);
        },
    });
}
