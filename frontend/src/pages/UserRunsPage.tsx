import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, Button,Box
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios"



const UserRunsPage: React.FC = () => {

    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [runs, setRuns] = useState<{ run_id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRun, setSelectedRun] = useState<string | null>(null);
    const navigate = useNavigate();

    const get_runs = () =>{
        const token = localStorage.getItem("access_token");
        const URL = import.meta.env.VITE_API_URL || "http://localhost/";
        const URL_ = `${URL}/api/data/myRuns`; // URL Base

    // Configurazione della richiesta
        const config = {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        };

        axios.get(URL, config)
        .then((response) => {
   
            setRuns(response.data.runs || []);
            setLoading(false);
            console.log(response.data.runs);
        })
        .catch((error) => {
            
            if (error.response && error.response.status === 401) {
                console.error("Authentication failed or token expired.");
            } else {
                console.error("Error fetching projects:", error);
            }
            
            
            localStorage.removeItem("access_token");
            navigate("/");
        });
    }

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            
            navigate("/");
            return;
        }
           get_runs();

        //fa get_runs ogni 3 secondi
        const intervalId = setInterval(() => {
           get_runs();
            
        }, 3000);

        
        return () => clearInterval(intervalId);
        
    }, [navigate]);

  
    const handleEnterRun = (run_id: string) => {

        const token = localStorage.getItem("access_token");

        console.log("I will inspect :");
        console.log(run_id);

        navigate(`/myruns/${run_id}/files`);

       
    };

    // Function to open delete confirmation dialog
    const handleOpenDeleteDialog = (runs_id: string) => {

        setSelectedRun(null);
        setOpenDialog(true);
    };

    // Function to close delete confirmation dialog
    const handleCloseDeleteDialog = () => {
        setSelectedRun(null);
        setOpenDialog(false);
    };

    // Function to delete a RUN
    const handleDeleteRun = async() => {
        if (!selectedRun) return;

     
        const token = localStorage.getItem("access_token");

        setLoading(true);

         const config = {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        };
        console.log("I will delete :");
        console.log(selectedRun);

        try {
                    
                 //   await axios.delete(`${URL}/api/data/run/${selectedRun}`,config);
                    
                    // Remove from local state
                    handleCloseDeleteDialog();
                  //  get_project();
                    alert('TO DO!');
                } catch (error) {
                    console.error('Error deleting file:', error);
                    alert('Failed to delete file');
                }
        
       
    };

  
  

    return (
        <DashboardLayout>
                <Box 
                        display="flex"          
                        alignItems="center"     
                        justifyContent="space-between" // Spinge gli elementi ai lati opposti
                        mb={3}>
                {/* Elemento a sinistra */}
                <Typography variant="h4" component="span">
                    Your Runs
                </Typography>

              

                
            </Box>
            

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Run ID</strong></TableCell>
                                <TableCell><strong>Project id</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {runs.length > 0 ? (
                                runs.map((run) => (
                                    <TableRow key={run.id}>
                                        <TableCell>{run.id}</TableCell>
                                        <TableCell>{run.project_id}</TableCell>
                                        <TableCell>{run.status}</TableCell>


                                        <TableCell>
                                            <IconButton onClick={() => handleEnterRun(run.id)} color="primary">
                                                <PlayArrowIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleOpenDeleteDialog(run.id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No runs found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete Project "{selectedRun}"? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteRun} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default UserRunsPage;