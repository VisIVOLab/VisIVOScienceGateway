import React from "react";
import { Typography } from "@mui/material";
import DashboardLayout from "../layouts/DashboardLayout";
import Upload_button from "../components/Upload_button";
import { useAuth } from '../context/AuthContext';

import axios from "axios"
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {

    const navigate = useNavigate();
    const token = localStorage.getItem("access_token");
    const URL = import.meta.env.VITE_API_URL || "http://localhost/";


    const handleTestClick = async () => {
        // Qui metterai la logica che vuoi eseguire quando si clicca il bottone
        console.log("Button Test Cliccato!");
        alert("Il test è stato eseguito!");
        const token = localStorage.getItem("access_token");

         try {

        const config = {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        };
        
            const response = await axios.get(`${URL}/api/data/cleanRUN`, config);

           

            
            //localStorage.setItem("access_token", data.access_token);
            //navigate("/dashboard");
            console.log(response.data.message)
            const header= document.getElementById("res");
            header.innerText=response.data.message;

        } catch (err) {
            alert("Invalid credentials. Please try again.");
        }    
    
    };

    return (
        <DashboardLayout>
            <Typography variant="h4">Welcome to the Dashboard</Typography>
            <Typography variant="body1">
                Here you can manage your data and settings.
            </Typography>
            <button id="bTest" onClick={handleTestClick}>Test </button> <br></br>
            
            <h1 id="res"> </h1>
        </DashboardLayout>
    );
};

export default DashboardPage;