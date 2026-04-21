import api from "../../../api";
import type { ApiResponse, UserDTO, ChangePasswordRequest } from "../../../types";

export const User_service = {
    getProfile: () =>
        api.get<ApiResponse<UserDTO>>('/users/profile'),

    updateProfile: (data: Partial<UserDTO>) =>
        api.put<ApiResponse<UserDTO>>('/users/profile', data),

    changePassword: (data: ChangePasswordRequest) =>
        api.put<ApiResponse<void>>('/users/change-password', data),
};
