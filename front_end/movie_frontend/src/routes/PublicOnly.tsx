import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicOnly({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    //giải sử user vào trang mà cần có quyền đăng nhập thì sẽ bị đá sang trang đăng nhập
    //hàm này có tác dụng khi đăng nhập thành công sẽ truy cập vào trang vừa bị đá
    //bằng cách nếu chưa đăng nhập thì đẩy qua login khi đăng nhập thì user trong auth thay đổi sẽ render lại
    const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/user";

    if (isLoading) return null;
    if (user) return <Navigate to={from} replace />;

    return children;
}

