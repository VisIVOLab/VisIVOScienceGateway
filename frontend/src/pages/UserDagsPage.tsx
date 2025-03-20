import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, Button
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardLayout from "../layouts/DashboardLayout";

const UserDagsPage: React.FC = () => {
    const [dags, setDags] = useState<{ dag_id: string; created_at: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDag, setSelectedDag] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/");
            return;
        }

        fetch("http://localhost:8000/dag/list", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Unauthorized");
                }
                return res.json();
            })
            .then((data) => {
                setDags(data.dags || []);
                setLoading(false);
            })
            .catch(() => {
                localStorage.removeItem("access_token");
                navigate("/");
            });
    }, [navigate]);

    // Function to start a DAG
    const handleStartDag = (dagId: string) => {
        const token = localStorage.getItem("access_token");
        fetch(`http://localhost:8000/dag/start/${dagId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then(() => alert(`DAG ${dagId} started successfully!`))
            .catch((err) => console.error("Error starting DAG:", err));
    };

    // Function to open delete confirmation dialog
    const handleOpenDeleteDialog = (dagId: string) => {
        setSelectedDag(dagId);
        setOpenDialog(true);
    };

    // Function to close delete confirmation dialog
    const handleCloseDeleteDialog = () => {
        setSelectedDag(null);
        setOpenDialog(false);
    };

    // Function to delete a DAG
    const handleDeleteDag = () => {
        if (!selectedDag) return;

        const token = localStorage.getItem("access_token");
        fetch(`http://localhost:8000/dag/delete/${selectedDag}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then(() => {
                setDags(dags.filter(dag => dag.dag_id !== selectedDag));
                alert(`DAG ${selectedDag} deleted successfully!`);
                handleCloseDeleteDialog();
            })
            .catch((err) => console.error("Error deleting DAG:", err));
    };

    return (
        <DashboardLayout>
            <Typography variant="h4" gutterBottom>
                Your DAGs
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>DAG ID</strong></TableCell>
                                <TableCell><strong>Created At</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dags.length > 0 ? (
                                dags.map((dag) => (
                                    <TableRow key={dag.dag_id}>
                                        <TableCell>{dag.dag_id}</TableCell>
                                        <TableCell>{new Date(dag.created_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleStartDag(dag.dag_id)} color="primary">
                                                <PlayArrowIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleOpenDeleteDialog(dag.dag_id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No DAGs found
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
                    Are you sure you want to delete DAG "{selectedDag}"? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteDag} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default UserDagsPage;