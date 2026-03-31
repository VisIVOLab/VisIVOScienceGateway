import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Box } from "@mui/material";

const DashboardLayout = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const URL = import.meta.env.VITE_API_URL || "http://localhost/";

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/");
            return;
        }

        fetch(URL+"/api/auth/me", {
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
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Navbar */}
            <Navbar username={user?.username} toggleSidebar={toggleSidebar} />

            <Box sx={{ display: "flex", flexGrow: 1 }}>
                {/* Sidebar */}
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{ flexGrow: 1, p: 3, mt: "64px", transition: "margin 0.3s" }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardLayout;