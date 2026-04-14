import api from "../../../api";
import type { LoginRequest, RegisterRequest, JwtResponse, UserDTO, ApiResponse } from "../../../types";

export const authService = {
    login: (data: LoginRequest) =>
        api.post<ApiResponse<JwtResponse>>("/auth/login", data),

    register: (data: RegisterRequest) =>
        api.post<ApiResponse<UserDTO>>("/auth/register", data),

    googleLogin: (idToken: string) =>
        api.post<ApiResponse<JwtResponse>>("/auth/google-login", { idToken }),
};
