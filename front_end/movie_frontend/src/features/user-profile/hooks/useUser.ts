import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User_service } from "../services/userService";
import type { UserDTO } from "../../../types";

export const useProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const resp = await User_service.getProfile();
            return resp.data.data;
        }
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<UserDTO>) => User_service.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: any) => User_service.changePassword(data)
    });
};
