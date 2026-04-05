import { Outlet } from "react-router-dom";
import Navbar from "../shared/NavBar.tsx";
import Footer from "../shared/Footer.tsx";

export default function RegisterLayout() {
    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />
            <main className="pt-20">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
