import { useState, type FormEvent, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogin, useRegister } from "./useAuth";

export function useAuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/user";

    const loginMutation = useLogin();
    const registerMutation = useRegister();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setErrorMessage(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        const { username, password, email } = formData;

        if (!username.trim() || !password) return;
        if (!isLogin && !email.trim()) {
            setErrorMessage("Email is required for registration.");
            return;
        }

        if (isLogin) {
            loginMutation.mutate({ username, password }, {
                onSuccess: () => {
                    setSuccessMessage("Signed in successfully.");
                    navigate(from, { replace: true });
                },
                onError: (err: any) => {
                    setErrorMessage(err.message || "Login failed.");
                }
            });
        } else {
            registerMutation.mutate({ username, password, email }, {
                onSuccess: () => {
                    setSuccessMessage("Account created. Please sign in.");
                    setIsLogin(true);
                    setFormData({ username: "", email: "", password: "" });
                },
                onError: (err: any) => {
                    setErrorMessage(err.message || "Registration failed.");
                }
            });
        }
    };

    return {
        isLogin,
        formData,
        isSubmitting: loginMutation.isPending || registerMutation.isPending,
        errorMessage,
        successMessage,
        handleInputChange,
        handleSubmit,
        toggleMode,
    };
}
