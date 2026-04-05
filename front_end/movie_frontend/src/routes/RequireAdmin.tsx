import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return null;

    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    if (user.role !== 'ADMIN') {
        return <Navigate to="/user" replace />;
    }

    return <Outlet />;
}
