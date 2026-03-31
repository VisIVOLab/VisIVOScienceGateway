import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, Button,Box,
    RadioGroup,
    Radio,
    FormControl,
    FormControlLabel
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios"
import GlobalSnackBar from '../components/GlobalSnackBar';


const UserProjectsPage: React.FC = () => {
    const URL = import.meta.env.VITE_API_URL || "http://localhost/";
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [PrjType,setPrjType] = useState(0)
    const [ProjName, setProjName] = useState(""); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projects, setProjects] = useState<{ project_id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const navigate = useNavigate();

    const get_project = () =>{
        const token = localStorage.getItem("access_token");

        const URL = "https://visivo-server.oact.inaf.it/api/data/myProjects"; // URL Base

    // Configurazione della richiesta
        const config = {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        };

        axios.get(URL, config)
        .then((response) => {
   
            setProjects(response.data.projects || []);
            setLoading(false);
            console.log(response.data.projects);
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

        get_project()
    }, [navigate]);

    // Function to start a START
    const handleEnterProject = (project_id: number) => {
        const token = localStorage.getItem("access_token");

        console.log("I will inspect :");
        console.log(project_id);

        navigate(`/myproject/${project_id}/files`);

        
    };

    // Function to open delete confirmation dialog
    const handleOpenDeleteDialog = (project_id: number) => {
        setSelectedProject(project_id);
        setOpenDialog(true);
    };

    // Function to close delete confirmation dialog
    const handleCloseDeleteDialog = () => {
        setSelectedProject(null);
        setOpenDialog(false);
    };

    // Function to delete a DAG
    const handleDeleteProject = async() => {
        if (!selectedProject) return;

        const token = localStorage.getItem("access_token");

        setLoading(true);

         const config = {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        };
        console.log("I will delete :");
        console.log(selectedProject);

        try {
                    // Replace with your actual API endpoint
                    await axios.delete(`${URL}/api/data/project/${selectedProject}`,config);
                    
                    // Remove from local state
                    handleCloseDeleteDialog();
                    get_project();
                    showNotification("Project deleted!", "success");
                } catch (error) {
                    console.error('Error deleting file:', error);
                    showNotification("Failed to  delete project!", "error");

                }
        
       
    };

    const showForm = () => {
            setIsModalOpen(true);

    }

    const HandleConfirm = async () =>{
        console.log("I wil create project : ");
        console.log(ProjName);

        const token = localStorage.getItem("access_token");

        const URL = "https://visivo-server.oact.inaf.it/api/data/newProject"; // URL Base

        const config = {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        };

         const payload = {
            project_name: ProjName,
            project_type: PrjType
            // Usa snake_case per convenzione Python
        };
        try{
            const response = await  axios.post(URL, payload,config);
            if(response.data.status =="ERR")
            {
                showNotification("Error -"+ response.data.message + " try again", "error");
            }else
            {
                showNotification("Project create!","success")
                setIsModalOpen(false);
                setProjName("")
                setPrjType(0)
                get_project();
            }

        }catch (error) {
            console.error("Error :", error);
            showNotification("Error -"+error, "error");


        }


    }

    const HandleClose = () => {
            setIsModalOpen(false);
            setProjName("");
            setPrjType(0);
    }


    //funzioni snackbar

    const showNotification = (msg, type = 'success') => 
    {
        setSnackbarMessage(msg);
        setSnackbarSeverity(type);
        setSnackbarOpen(true);
    };

  
  const handleCloseSnackbar = (event, reason) => 
    {
        if (reason === 'clickaway')
        {
            return;
        }
        setSnackbarOpen(false);
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
                    Your Projects
                </Typography>

                {/* Elemento a destra */}
                <Button variant="contained" onClick={()=>showForm()}>
                    New project
                </Button>

                {isModalOpen && (    <div  id="form" className="fixed inset-0   bg-black bg-opacity-50 z-40 ">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center  
                                                         fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"  >
                
                                <div >
                                  <label>Project name:</label>  <input className="p-2 mb-2 border rounded" type="text" name="dir_name" placeholder="my_project_1" required onChange={(e) => setProjName(e.target.value)}></input>
                                   <FormControl>
                                    <RadioGroup 
                                    row
                                    defaultValue="1"
                                    value={PrjType} 
                                    onChange={(event) => setPrjType(parseInt(event.target.value))}> 

                                    <FormControlLabel value="1"  control={<Radio />} label="Classic" />
                                    <FormControlLabel value="2"  control={<Radio />} label="PyAETNA" />

                                     </RadioGroup>
                                   </FormControl>
                                    
                                        

                                   
                                </div>
                                    <Button color="error" variant="contained" onClick={HandleClose} sx={{ mr: 2 }}>Close</Button> 
                                    <Button  variant="contained" onClick={HandleConfirm}>Confirm</Button>
                            </div>
                        </div>)}

            </Box>
            

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Project ID</strong></TableCell>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Type</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projects.length > 0 ? (
                                projects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell>{project.id}</TableCell>
                                        <TableCell>{project.name}</TableCell>
                                        <TableCell>{project.project_type.name}</TableCell>


                                        <TableCell>
                                            <IconButton onClick={() => handleEnterProject(project.id)} color="primary">
                                                <PlayArrowIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleOpenDeleteDialog(project.id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No project found
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
                    Are you sure you want to delete Project "{selectedProject}"? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteProject} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        <GlobalSnackBar 
            open={snackbarOpen}
            message={snackbarMessage}
            severity={snackbarSeverity}
            onClose={handleCloseSnackbar}
            />
        </DashboardLayout>
    );
};

export default UserProjectsPage;