import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl,
    FormLabel, Chip,List,ListItem,ListItemText,Tabs,Tab,Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";

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
    


const RunningTab = ({ outputs, runStatus, alertColor, currentRunId, handleDownload,handleNewRun }) => {

    return(

          <Box>
                        <Typography variant="h4" component="span" mb={3} display="block">
                            Run Output
                        </Typography>

                        <Alert severity={alertColor} sx={{ mb: 3 }}>
                            <Typography variant="body1">
                                Job SUBMITTED! The run status is {runStatus}
                            </Typography>
                            <Typography variant="body2">
                                {outputs.length} output file(s) generated
                            </Typography>
                        </Alert>
                        

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>File Name</strong></TableCell>
                                        <TableCell><strong>Type</strong></TableCell>
                                        <TableCell><strong>Action</strong></TableCell>

                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {outputs.length > 0 ? (
                                        outputs.map((file) => (
                                            <TableRow key={file.id}>
                                                <TableCell>{file.original_name}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={file.file_type.name}
                                                        color="success"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                 <TableCell>
                                                 <IconButton
                                                         onClick={() => handleDownload(file.id,file.original_name)}
                                                            color="primary"> <DownloadIcon /></IconButton>
                                                </TableCell>
                                
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                No output files generated yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button 
                                variant="outlined" 
                                onClick={() => {
                                    setActiveTab(0);
                                    setAvailableTabs([0]);
                                    setUploadedFilesList([]);
                                    setOutputs([]);
                                }}
                            >
                                Back to Project
                            </Button>
                            <Button variant="contained" onClick={handleNewRun}>
                                Start New Run
                            </Button>
                        </Box>
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <LiveLogViewer runId={currentRunId} />
                        </Box>
                    </Box>)
};

export default RunningTab;