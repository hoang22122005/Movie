import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../shared/NavBar.tsx";
import Footer from "../shared/Footer.tsx";
import MobileNav from "../shared/MobileNav.tsx";

export default function AppLayout() {
    const location = useLocation();

    // Kiểm tra xem có phải là trang chủ (có Hero) hay không
    const isHeroPage = location.pathname === "/user" || location.pathname === "/";

    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
            <Navbar />

            {/* Sử dụng template string để thay đổi padding tùy thuộc vào trang */}
            <main className={`flex-1 overflow-x-hidden flex flex-col ${isHeroPage ? 'pt-0' : 'pt-28'}`}>
                <div className="flex-1">
                    <Outlet />
                </div>
                <Footer />
            </main>

            <MobileNav />
        </div>
    );
}
