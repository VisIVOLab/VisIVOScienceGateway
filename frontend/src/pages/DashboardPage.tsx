import React from "react";
import { Typography } from "@mui/material";
import DashboardLayout from "../layouts/DashboardLayout";

const DashboardPage = () => {
    return (
        <DashboardLayout>
            <Typography variant="h4">Welcome to the Dashboard</Typography>
            <Typography variant="body1">
                Here you can manage your data and settings.
            </Typography>
        </DashboardLayout>
    );
};

export default DashboardPage;