import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Container, CircularProgress } from "@mui/material";

const DashboardLayout = ({ children }) => {
    const [user, setUser] = useState<{ username: string } | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

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
    
    if (!user) {
        return (
            <Container>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-col flex-1">
                {/* Navbar */}
                <Navbar username={user.username} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* Main Content */}
                <main className="p-4">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;