import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import LoginLayout from "../layouts/AuthLayout";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login";
import UserHomePage from "../pages/UserHomePage";
import BrowsePage from "../pages/BrowsePage";
import WatchlistPage from "../pages/WatchlistPage";
import WatchPage from "../pages/WatchPage";
import ProfilePage from "../pages/ProfilePage";
import VipUpgrade from "../pages/VipUpgrade";
import PublicOnly from "./PublicOnly";
import RequireAuth from "./RequireAuth";
import RegisterLayout from "../layouts/RegisterLayout.tsx";

function NotFoundPage() {
    return (
        <div className="mx-auto max-w-5xl px-6 py-10">
            <h1 className="text-3xl font-black tracking-tight">404</h1>
            <p className="mt-2 text-outline">Page not found.</p>
        </div>
    );
}

import RequireAdmin from "./RequireAdmin";
import AdminPage from "../pages/AdminPage";
import PaymentCallback from "../pages/PaymentCallback";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<LoginLayout />}>
                    <Route
                        path="/login"
                        element={
                            <PublicOnly>
                                <Login />
                            </PublicOnly>
                        }
                    />
                </Route>

                <Route element={<RegisterLayout />}>
                    <Route
                        path="/"
                        element={
                            <PublicOnly>
                                <HomePage />
                            </PublicOnly>
                        } />
                </Route>

                <Route element={<AppLayout />}>
                    <Route path="/browse" element={<BrowsePage />} />
                    <Route path="/watch/:movieId" element={<WatchPage />} />
                    <Route element={<RequireAuth />}>
                        <Route path="/user" element={<UserHomePage />} />
                        <Route path="/watchlist" element={<WatchlistPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/vip-upgrade" element={<VipUpgrade />} />
                    </Route>

                    {/* Payment callback không cần auth - VNPay redirect thẳng về đây */}
                    <Route path="/payment-callback" element={<PaymentCallback />} />

                    <Route element={<RequireAdmin />}>
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
