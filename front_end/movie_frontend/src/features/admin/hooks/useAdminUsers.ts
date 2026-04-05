import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, type GetUsersParams } from "../services/adminService";

export const useAdminUsers = (params: GetUsersParams) => {
    return useQuery({
        queryKey: ["admin", "users", params],
        queryFn: async () => {
            const res = await adminService.getUsers(params);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
    });
};

export const useAdminUserDetail = (id: number | string) => {
    return useQuery({
        queryKey: ["admin", "user", id],
        queryFn: async () => {
            const res = await adminService.getUserById(id);
            if (!res.data.success) throw new Error(res.data.message);
            return res.data.data;
        },
    });
};

export const useAdminUserActions = () => {
    const queryClient = useQueryClient();

    const deleteUserMutation = useMutation({
        mutationFn: (id: number | string) => adminService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });

    return { deleteUserMutation };
};
