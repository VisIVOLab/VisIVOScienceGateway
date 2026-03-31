
import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl,
    FormLabel, Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { ConstructionOutlined, Dashboard } from "@mui/icons-material";
import DashboardLayout from "../layouts/DashboardLayout";
import DownloadIcon from '@mui/icons-material/Download';

interface Output {
    id: string;
    original_name: string;
    file_type: string;
    
};


const RunDetailsPage = () => {
    
    const [outputs, setOutputs] = useState<Output[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
    const navigate = useNavigate();
    const URL = import.meta.env.VITE_API_URL || "http://localhost/";
    const { run_id } = useParams();
    // Fetch files on component mount
    useEffect(() => {
        const token = localStorage.getItem("access_token");

        // 1. Verifica di Autenticazione (Frontend Guard)
        if (!token) {
            console.error("Token non trovato. Reindirizzamento.");
            localStorage.removeItem("access_token");
            navigate("/"); // Reindirizza al login
            return;
        }
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        const token = localStorage.getItem("access_token");
        console.log(run_id);
        try {
            setLoading(true);
            
             const config = {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            };
            const response = await axios.get(`${URL}/api/data/run/${run_id}`,config);
            console.log(response.data);
            setOutputs(response.data);
        } catch (error) {
            console.error('Error fetching files:', error);
            // Don't show error if API endpoint doesn't exist yet
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.log('API endpoint not configured yet - using empty state');
                setOutputs([]);
            } else {
                alert('Failed to load files');
            }
        } finally {
            setLoading(false);
        }
    };


  

   

    const handleDownload = async (output_id: string,fileName: string) =>
    {
        const token = localStorage.getItem("access_token");

        if(!token)
        {
            alert("Not auth!");
            navigate("/");
        }

        const config = {
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${token}` 
            }
        };

        try 
        {

           const resp = await axios.get(`${URL}/api/data/output/${output_id}/download`,config);
           const url = window.URL.createObjectURL(new Blob([resp.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Impostiamo il nome del file (importante se il browser non lo legge dagli header)
            link.setAttribute('download', fileName);
            
            document.body.appendChild(link);
            link.click();
            
            // Pulizia
            link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file');
        }

    };

   
    

    return (
        <DashboardLayout>
        <Box sx={{ p: 3 }}>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={3}
            >
                <Typography variant="h4" component="span">
                   Run {run_id} outputs:
                </Typography>

            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>File Name</strong></TableCell>
                                <TableCell><strong>Type</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {outputs.length > 0 ? (
                                outputs.map((output) => (
                                    <TableRow key={output.id}>
                                        <TableCell>{output.original_name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={output.file_type.name}
                                                color="primary"
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                       
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleDownload(output.id,output.original_name)}
                                                color="primary"
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No files. 
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                
            )}
            
            

      
            
            
        </Box>
        </DashboardLayout>
    );


};


export default RunDetailsPage;