
import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl,
    FormLabel, Chip,List,ListItem,ListItemText,Tabs,Tab,Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as yaml from 'js-yaml';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { Add as AddIcon } from "@mui/icons-material";
import DashboardLayout from "../layouts/DashboardLayout";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import GlobalSnackBar from '../components/GlobalSnackBar';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import LiveLogViewer from "../components/LiveLogViewer";
import DownloadIcon from '@mui/icons-material/Download';
import { SlurmConfirmationModal } from "../components/SlurmParamModel";
import RunningTab from "../components/RunningTabComponent";
import {ConfigGenerator} from "../components/config-generator/ConfigGenerator";
import { ConfigRunInputs } from "../components/InputComponent";
interface Upload {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    category: 'cwl' | 'yml' | 'input';
}
interface Output {
    id: string;
    original_name: string;
    file_type: string;
    
};

interface FileToUpload {
  id: string;  //just for frontend logics
  file: File;
  type: 'input' | 'yml';
};

    const statusColorMap = {
    "PENDING": "warning",   // Giallo/Arancione
    "RUNNING": "warning",   // Giallo/Arancione
    "COMPLETED": "success", // Verde
    "FAILED": "error",      // Rosso 
  }
const ProjectDetails = () => {

    const URL = import.meta.env.VITE_API_URL || "http://localhost/";
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    
    const [project_type,setProjType] = useState(0);
    const [customProjectParameters, setCustomProjectParameters] = useState("");
    //input 

    const [runConfigDialogOpen, setRunConfigDialogOpen] = useState(false);
    const [currentRunId, setCurrentRunId] = useState<string | null>(null);
    const [missingRequirements, setMissingRequirements] = useState<Record<string, string>>({});
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [fileCategory, setFileCategory] = useState<'input' | 'yml'>("input");
    const [isUploading_r, setIsUploading_r] = useState(false);
    const [uploadedFilesList, setUploadedFilesList] = useState<{name: string, type: string}[]>([]);
    const [pendingFiles, setPendingFiles] = useState<FileToUpload[]>([]);
    const [submitted,setSubmittedState] = useState(false);
    //tabs
    const [activeTab, setActiveTab] = useState(0);
    const [availableTabs, setAvailableTabs] = useState([0]);
    const [outputs, setOutputs] = useState<Output[]>([]);
        
    //status
    const [runStatus,setRunStatus] = useState("PENDING")
    const [alertColor,setAlertColor] = useState(statusColorMap["PENDING"]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [uploads, setUploads] = useState<Upload[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<'cwl' | 'yml' | 'input'>('cwl');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { project_id } = useParams();

    // Slurm form variables
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({}); 
    const [slurmData, setSlurmData] = useState({
        accountSlurm: '',
        nodi: 1,
        ntaskPerNode: 1,
        partition: '128g' 
    });

    //per aggiungere la configurazione custom al progetto 2
    useEffect(() => {
    
    if (tempFile && project_type === 2 && tempFile.name === "config.yaml") {
        console.log("Ora il file è presente nello stato:", tempFile);
        handleAddToPending(); 
        handleProjectType2(tempFile);
      
    }
    }, [tempFile, project_type]);


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
        get_project_type();
        fetchFiles();

          const pollInterval = setInterval(() => {
            fetchOutputs();
            fetchStatus()
        }, 3000); 

        return () => clearInterval(pollInterval);
    }, [currentRunId]);

    const get_project_type = async() =>
    {
        const token = localStorage.getItem("access_token");
        console.log(project_id);
        try {
            setLoading(true);
            // Replace with your actual API endpoint
             const config = {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            };
            const response = await axios.get(`${URL}/api/data/project_type/${project_id}`,config);
            console.log(response.data);
            setProjType(response.data);
        } catch (error) {
            console.error('Error fetching type:', error);
          
            showNotification("Failed to load type! ", "error");
            
        } 
    } 

    const fetchFiles = async () => {
        const token = localStorage.getItem("access_token");
        console.log(project_id);
        try {
            setLoading(true);
            // Replace with your actual API endpoint
             const config = {
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            };
            const response = await axios.get(`${URL}/api/data/project/${project_id}`,config);
            console.log(response.data);
            setUploads(response.data);
        } catch (error) {
            console.error('Error fetching files:', error);
          
            showNotification("Failed to load files! ", "error");
            
        } finally {
            setLoading(false);
        }
    };


    const formattaTimestamp = (timestampString)=> {
 
            const data = new Date(timestampString);


           const opzioni = {
                year: 'numeric',
                month: '2-digit', // '20' per il mese
                day: '2-digit',   // '01' per il giorno
                hour: '2-digit',
                minute: '2-digit',

                // Per assicurarsi che venga usata l'ora locale e non UTC
                timeZone: 'Europe/Rome', // O la timezone desiderata, 'local' per quella del browser
                
                hour12: false 
            };
            const formatter = new Intl.DateTimeFormat('it-IT', opzioni);

            const dataFormattata = formatter.format(data);

  
            return dataFormattata.replace(', ', ' - ');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    const handleUploadConfirm = async () => {
        if (!selectedFile) {
            showNotification("Please select a file! ", "error");

            return;
        }

        try {
            setIsUploading(true);

            const token = localStorage.getItem("access_token");
            if (!project_id) {
                showNotification("Error: No id project!", "error");
                navigate('/');
                return;
            }
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('category', selectedCategory);
            formData.append('project_id', project_id);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}` ,
                    
                }
            };
       
            await axios.post(`${URL}/api/data/upload`, formData,config);

            showNotification("File uploaded!", "success");
           

            // Refresh the file list
            await fetchFiles();

            // Close dialog and reset
            handleCloseUploadDialog();
        } catch (error) {
            console.error('Error uploading file:', error);
            
            showNotification("Fail to upload!", "error");

        } finally {
            setIsUploading(false);
        }
    };

    const handleCloseUploadDialog = () => {
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        setSelectedCategory('cwl');
    };

    const handleOpenDeleteDialog = (id: string) => {
        setSelectedUploadId(id);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedUploadId(null);
    };

    const handleDeleteFile = async () => {
        if (!selectedUploadId) return;
        const token = localStorage.getItem("access_token");

        if(!token)
        {
            showNotification("Not authenticated", "error");

            navigate("/");
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        };
        try {
            
            await axios.delete(`${URL}/api/data/upload/${selectedUploadId}`,config);
          
            fetchFiles();
            showNotification("File deleted!", "success");
            
            handleCloseDeleteDialog();
        } catch (error) {
            console.error('Error deleting file:', error);
            showNotification("Error deleting: "+error, "success");

        }
    };



    const handleSubmit= async ()=>{
        
        if (uploads.length <= 0)
        {
            showNotification("No file uploaded!", "error");
            return
            
        }

        const token = localStorage.getItem("access_token");

        if(!token)
        {
            showNotification("Not authenticated", "error");

            navigate("/");
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        };
        const payload = { 
        project_id: project_id,
        run_id: currentRunId
        };

        try
        {

            const response = await axios.post(`${URL}/api/data/submit`,payload,config);
             setActiveTab(2);
            setOpenSnackbar(true);
            setSubmittedState(true);
            
        }catch (error) {
            console.error('Error submit file:', error);
            showNotification("Failed to submit!", "error");
            setSubmittedState(false);


        }
    }

    
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };
    const action = (
        <Button 
            color="inherit" 
            size="small" 
            onClick={() => navigate('/myruns')} 
        >
           Go to My Runs!
        </Button>
    );

     //funzioni snackbar

    const showNotification = (msg, type = 'success') => 
    {
        setSnackbarMessage(msg);
        setSnackbarSeverity(type);
        setSnackbarOpen(true);
    };

  
  const handleCloseSnackbar_event = (event, reason) => 
    {
        if (reason === 'clickaway')
        {
            return;
        }
        setSnackbarOpen(false);
  };

  const handleNewRun = async (customParams?: string | React.MouseEvent | unknown) =>
  {     
           
        if (uploads.length <= 0 && project_type==1)
        {
            showNotification("No file uploaded!", "error");
            return
            
        }

        const token = localStorage.getItem("access_token");

        if(!token)
        {
            showNotification("Not authenticated", "error");

            navigate("/");
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}` 
            }
        };
        const payload = { 
        project_id: project_id 
        };

        try
        {

            const response = await axios.post(`${URL}/api/data/newRun`,payload,config);
            
            console.log(response.data.inputs);
            console.log(response.data.run_id);

            //setOpenSnackbar(true);
            setCurrentRunId(response.data.run_id);
            setMissingRequirements(response.data.inputs);


            //per il dialog 
             setActiveTab(1);
            setUploadedFilesList([]);
            setTempFile(null);
            setFileCategory('input');
            console.log("Project type: ", project_type);

            //La run creata è per un progetto guidato, carico già la configurazione fatta.
            if(project_type==2)
            {
               if (customParams && typeof customParams === 'string')
               {
                    setFileCategory('input'); 
                    setTempFile(new File([customParams], "config.yaml", { type: "text/yaml" }));
                    handleProjectType2(new File([customParams], "config.yaml", { type: "text/yaml" }));
               }
                else return;
                              

                
                
            }
            
            // Apre il dialog
            setRunConfigDialogOpen(true);
           
        }catch (error) {
            console.error('Error creating new run:', error);
            showNotification("Failed to create new run!", "error");

        }

  };

  //Prende il nome del file .dat da analizzare e lo manda al backend per creare un il file di configurazione per streamflow
  const handleProjectType2 = async(pyaetnaFile: File) =>
  { 
    const token = localStorage.getItem("access_token");
    
    const text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject("Error reading the file");
            reader.readAsText(pyaetnaFile);
        });

    
    const pyaetnaFile_yaml = yaml.load(text);
    //console.log("Contenuto del file YAML:", pyaetnaFile_yaml);
    const filePath = pyaetnaFile_yaml.data.file_path;
    console.log("Il percorso è:", filePath);

        try {
            console.log("Current run id: ", currentRunId);
            if (!currentRunId) return;
            const config = {    
                headers: {
                    Authorization: `Bearer ${token}` ,
                }
            };
             const formData = new FormData();
            formData.append('path', filePath);
            formData.append('run_id', currentRunId);
            await axios.post(`${URL}/api/data/config_type2`, formData, config);

        }catch (error) {
            console.error('Error creating config for project type 2:', error);
        }



    
  }

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setTempFile(event.target.files[0]);
        }
    };


    const handleAddToPending = () => {
        if (!tempFile) return;
        console.log("Adding to pending: ", tempFile.name, " as ", fileCategory);
        const newFile: FileToUpload = {
            id: `${Date.now()}-${Math.random()}`,
            file: tempFile,
            type: fileCategory
        };

        setPendingFiles(prev => [...prev, newFile]);
        setTempFile(null);
    };

    const handleRemovePending = (id: string) => {
        setPendingFiles(prev => prev.filter(f => f.id !== id));
    };

    const checkFiles = async () =>{
        
        const normalize = (p) => {
            if (typeof p !== "string") return null;
            return p
                .trim()
                .replace(/^\.\//, "")   // rimuove ./
                .replace(/,$/, "");     // rimuove virgola finale
        };

        let configFile = pendingFiles.find(obj => obj.type === "yml");
        if(!configFile ) 
        {
            alert("Error, no config yml");
            return false;

        }

        const file_obj = configFile.file;

        const text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject("Error reading the file");
            reader.readAsText(file_obj);
        });

        // Parsing YAML
        const configData = yaml.load(text);

        // Estraggo i path
        const paths = Object.values(configData).map(item => normalize(item.path)).filter((p) => p);;
        console.log("PATH= "+ paths);
        // Controllo missing
       const missing = paths.filter(
    p => !pendingFiles.some(obj => normalize(obj.file.name) === p));

        console.log(missing);
        if (missing.length>0) {
            alert("Missing: " + missing);
            return false;
        }

        return true;
    };

    const handleUploadAll = async () => {
        if (pendingFiles.length === 0) return;
    
        if(project_type==1)
            if(!((await checkFiles()))) return;

       

        setIsUploading_r(true);


        try
        {
            
            const uploadPromises = pendingFiles.map(async (fileObj) => {
                if (!currentRunId) return;
                const formData = new FormData();
                formData.append('file', fileObj.file);
                formData.append('category', fileObj.type);
                formData.append('run_id', currentRunId);

                const token = localStorage.getItem("access_token");
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,

                    }
                };

                try {

                    await axios.post(
                        `${URL}/api/data/input/new`,
                        formData,
                        config
                    );

                    showNotification(`File '${fileObj.file.name}' uploaded!`, "success");

                    
                    return { name: fileObj.file.name, type: fileObj.type };

                } catch (error) {
                    
                    console.error(`Error uploading file ${fileObj.file.name}:`, error);
                    showNotification(`Fail to upload file '${fileObj.file.name}'!`, "error");

    
                    return null;
                }
            });

            const results = await Promise.all(uploadPromises);

            
            const successfulUploads = results.filter(r => r !== null) as { name: string; type: string; }[];;



            
            setUploadedFilesList(prev => [...prev, ...successfulUploads]);

            
            setPendingFiles([]);
        

        }catch(Error)
        {
            showNotification("A critical error occurred during upload setup!", "error");
          
        }finally
        {
            setIsUploading_r(false)
        }
       

    };

/* upload integrato in upload all
    const handleUploadInputFile = async (file : FileToUpload) =>
    {
        if (!currentRunId) return;

           try {
            setIsUploading_r(true);

            const token = localStorage.getItem("access_token");
            if (!project_id)
            {
                showNotification("Error: No id project!", "error");       
                navigate('/');
                return;
            }
            const formData = new FormData();
            formData.append('file', file.file);
            formData.append('category', file.type);
            formData.append('run_id', currentRunId);
            const config = {
                headers: {
                    Authorization: `Bearer ${token}` ,
                    
                }
            };
       
            await axios.post(`${URL}/api/data/input/new`, formData,config);

            showNotification("File uploaded!", "success");
           

            // Refresh the file list
            setUploadedFilesList(prev => [...prev , ...file]);

            // reset
            setTempFile(null);
            setPendingFiles([]);
            setFileCategory('input');
        } catch (error) {
            console.error('Error uploading file:', error);
            
            showNotification("Fail to upload!", "error");

        } finally {
            setIsUploading_r(false);
        }
    
    };*/
  

    //funzioni tabs
       const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        if (availableTabs.includes(newValue)) {
            setActiveTab(newValue);

          
        }
    };

    const fetchOutputs = async () => {
            const token = localStorage.getItem("access_token");
            console.log(currentRunId);
            if(!currentRunId) return;

            try {
               // setLoading(true);
               
                 const config = {
                    headers: {
                        Authorization: `Bearer ${token}` 
                    }
                };
                const response = await axios.get(`${URL}/api/data/run/${currentRunId}`,config);
                console.log(response.data);
                setOutputs(response.data);
            } catch (error) {
                console.error('Error fetching files:', error);
                
            } finally {
                setLoading(false);
            }
        };

    
    const fetchStatus = async ()=>{
         const token = localStorage.getItem("access_token");
            console.log(currentRunId);
            if(!currentRunId) return;
            try {
              //  setLoading(true);
               
                 const config = {
                    headers: {
                        Authorization: `Bearer ${token}` 
                    }
                };
                const response = await axios.get(`${URL}/api/data/run_status/${currentRunId}`,config);
                console.log(response.data);
                setRunStatus(response.data);
                let color : string = response.data;
                setAlertColor(statusColorMap[color])
            } catch (error) {
                console.error('Error fetching files:', error);
                
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
    
    const handleShowGraph = (upload_id: string) =>{
        const token = localStorage.getItem("access_token");
        if (!token) {
            
            navigate("/");
            return;
        }
         navigate(`/graph/${upload_id}`);
    }

    const handleBack = async() =>{

        setActiveTab(0)
        if(submitted) return;
        const token = localStorage.getItem("access_token");
    
        if(!token)
        {
           alert("Not auth!");
           navigate("/");
        }
    
        const config = {
             headers: {
                    Authorization: `Bearer ${token}` 
                }
            };

        try
        {
            const resp = await axios.delete(`${URL}/api/data/run/${currentRunId}`,config);

        }catch (error)
        {
            console.log("Error deleting "+error);
        }
        
    };

    //slurm parameter functions

    const handleInitialSubmit = (e) => {
        e.preventDefault(); 
        
        setIsModalOpen(true);
    };

   
    const closeModal = () => {
        setIsModalOpen(false);
    };

    //aggiornamento dei campi del Modal
    const handleSlurmDataChange = (e) => {
        const { name, value } = e.target;
        setSlurmData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Confirm nel Modal
    const handleFinalSubmit = async() => {
        // Chiudi il Modal
        setIsModalOpen(false);


        
        console.log('Dati del form principale:', formData);
        console.log('Dati Slurm aggiuntivi:', slurmData);

        const token = localStorage.getItem("access_token");
        if(!token)
        {
            showNotification("Not authenticated", "error");
            navigate("/");
        }

        try
        {
          

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            
            const resp = await axios.post(`${URL}/api/data/slurmParam/${currentRunId}`, slurmData, config);
            if (resp.data.status === "ok") 
            {
                handleSubmit();
            }
        } catch (error) {
            console.error("Error adding parameters :", error);
            showNotification("Error adding parameters", "error");
        }
    };


    return (
       <DashboardLayout>
        
            <Box sx={{ p: 3 }}>
                {/* Tabs Header */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab 
                            icon={<FolderIcon />} 
                            iconPosition="start" 
                            label="Project" 
                            disabled={!availableTabs.includes(0)}
                        />
                        <Tab 
                            icon={<SettingsIcon />} 
                            iconPosition="start" 
                            label="Run Configuration" 
                            disabled={!availableTabs.includes(1)}
                        />
                        <Tab 
                            icon={<PlayArrowIcon />} 
                            iconPosition="start" 
                            label="Running" 
                            disabled={!availableTabs.includes(2)}
                        />
                    </Tabs>
                </Box>
            </Box>
            
            {project_type==1 && (
                <Box>

                
                {/* TAB 1: Project - User Uploads */}
                {activeTab === 0 && (
                    <Box>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            mb={3}
                        >
                            <Typography variant="h4" component="span">
                                User Uploads
                            </Typography>

                            <Button
                                variant="contained"
                                startIcon={<UploadFileIcon />}
                                onClick={() => setIsUploadDialogOpen(true)}
                            >
                                Upload File
                            </Button>
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
                                            <TableCell><strong>Upload Date</strong></TableCell>
                                            <TableCell><strong>Actions</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {uploads.length > 0 ? (
                                            uploads.map((upload) => (
                                                <TableRow key={upload.id}>
                                                    <TableCell>{upload.original_name}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={upload.file_type.name}
                                                            color="primary"
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{formattaTimestamp(upload.uploaded_at)}</TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            onClick={() => handleOpenDeleteDialog(upload.id)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                        {upload.file_type.name === "cwl" && (
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => handleShowGraph(upload.id)}
                                                            >
                                                                <PlayArrowIcon />
                                                            </IconButton>
                                                        )}
                                                           
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No files uploaded yet. Click the "Upload File" button to upload files.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button variant="contained" onClick={handleNewRun}>
                                New RUN
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* TAB 2: Run Configuration */}
                {activeTab === 1 && (
                    <ConfigRunInputs
                          projectType={project_type}
                        missingRequirements={missingRequirements}
                        tempFile={tempFile}
                        fileCategory={fileCategory}
                        setFileCategory={setFileCategory}
                        pendingFiles={pendingFiles}
                        uploadedFilesList={uploadedFilesList}
                        isUploading={isUploading}
                        isUploading_r={isUploading_r}
                        handleFileSelection={handleFileSelection}
                        handleAddToPending={handleAddToPending}
                        handleRemovePending={handleRemovePending}
                        handleUploadAll={handleUploadAll}
                        handleBack={handleBack}
                        handleInitialSubmit={handleInitialSubmit}
                    />
                )}

                {/* TAB 3: Running - Output Files */}
                {activeTab === 2 && (
                   <RunningTab
                   outputs={outputs}
                   runStatus={runStatus}
                   alertColor={alertColor}
                   currentRunId={currentRunId}
                   handleDownload={handleDownload}
                   handleNewRun={handleNewRun}
                   ></RunningTab>
                )}
                </Box>
                ) }
                {/* Upload Dialog (for Tab 1) */}
                <Dialog open={isUploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Upload New File</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2, mb: 3 }}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                disabled={isUploading}
                            >
                                {selectedFile ? selectedFile.name : 'Choose File'}
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                            </Button>
                        </Box>

                        <FormControl component="fieldset" disabled={isUploading}>
                            <FormLabel component="legend">Category</FormLabel>
                            <RadioGroup
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as 'cwl' | 'yml' | 'run')}
                            >
                                <FormControlLabel value="cwl" control={<Radio />} label="CWL" />
                                <FormControlLabel value="yml" control={<Radio />} label="YML" />
                                <FormControlLabel value="run" control={<Radio />} label="RUN/YML" />
                            </RadioGroup>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUploadDialog} color="error" disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleUploadConfirm} variant="contained" disabled={isUploading || !selectedFile}>
                            {isUploading ? <CircularProgress size={24} /> : 'Upload'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete this file? This action cannot be undone.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteDialog} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteFile} color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for Submit */}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={handleCloseSnackbar} 
                        severity="success" 
                        sx={{ width: '100%' }}
                        action={action}
                    >
                        Job SUBMITTED!
                    </Alert>
                </Snackbar>
                
                {/* Global Snackbar for events */}
                <GlobalSnackBar 
                    open={snackbarOpen}
                    message={snackbarMessage}
                    severity={snackbarSeverity}
                    onClose={handleCloseSnackbar_event}
                />
                {/* Slurm Confirmation Modal */}
                <SlurmConfirmationModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSubmit={handleFinalSubmit}
                    slurmData={slurmData}
                    onDataChange={handleSlurmDataChange}
                />
            
            {project_type==2 && (

                <Box>
                    {activeTab === 0 && (
                    <ConfigGenerator fun_run={handleNewRun}/> )}
                    
                    {activeTab === 1 && (
                         <ConfigRunInputs
                         projectType={project_type}
                        missingRequirements={missingRequirements}
                        tempFile={tempFile}
                        fileCategory={fileCategory}
                        setFileCategory={setFileCategory}
                        pendingFiles={pendingFiles}
                        uploadedFilesList={uploadedFilesList}
                        isUploading={isUploading}
                        isUploading_r={isUploading_r}
                        handleFileSelection={handleFileSelection}
                        handleAddToPending={handleAddToPending}
                        handleRemovePending={handleRemovePending}
                        handleUploadAll={handleUploadAll}
                        handleBack={handleBack}
                        handleInitialSubmit={handleInitialSubmit}
                    />
                    )}

                    {activeTab === 2 && (
                          <RunningTab
                   outputs={outputs}
                   runStatus={runStatus}
                   alertColor={alertColor}
                   currentRunId={currentRunId}
                   handleDownload={handleDownload}
                   handleNewRun={handleNewRun}
                   ></RunningTab>
                        
                        )}
                </Box>


            )}
            
        </DashboardLayout>
    );


};


export default ProjectDetails;