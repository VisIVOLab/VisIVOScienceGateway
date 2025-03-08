import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ username: string } | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/");
            return;
        }

        fetch("http://localhost:8000/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((data) => setUser({ username: data.username }))
            .catch(() => {
                localStorage.removeItem("access_token");
                navigate("/");
            });
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                {user ? (
                    <p>Welcome, <strong>{user.username}</strong>!</p>
                ) : (
                    <p>Loading...</p>
                )}
                <button
                    className="bg-red-500 text-white p-2 mt-4 rounded hover:bg-red-600"
                    onClick={() => {
                        localStorage.removeItem("access_token");
                        navigate("/");
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default DashboardPage;