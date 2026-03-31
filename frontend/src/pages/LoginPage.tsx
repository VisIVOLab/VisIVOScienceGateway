import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const URL = import.meta.env.VITE_API_URL || "http://localhost/";
    console.log("API URL:", URL);
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        const formData = new FormData(event.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        try {
            const response = await fetch(URL+"/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error("Invalid username or password");
            }

            const data = await response.json();
            localStorage.setItem("access_token", data.access_token);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                {/* Logo */}
                <img 
                    src="/logo.png" 
                    alt="VisIVO Science Gateway Logo" 
                    className="w-24 mx-auto mb-4"
                />
                
                <h2 className="text-2xl font-bold mb-4">Login</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleLogin} className="flex flex-col">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        required
                        className="p-2 mb-2 border rounded"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        className="p-2 mb-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;