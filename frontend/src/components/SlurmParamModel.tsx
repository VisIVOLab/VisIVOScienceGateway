import * as React from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  MenuItem, 
  Box,
  Typography
} from '@mui/material';

export function SlurmConfirmationModal({ isOpen, onClose, onSubmit, slurmData, onDataChange }) {
  if (!isOpen) return null;

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    // Converte in numero intero. Se non valido, usa il valore precedente.
    const numericValue = parseInt(value, 10);

    if (!isNaN(numericValue) && numericValue >= 1) {
      onDataChange(e);
    } else if (value === '') {
       // Permette di svuotare il campo
      onDataChange(e);
    }
  };

  return( 
  <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h5" component="div">
          Slurm Parameters
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box 
          component="form" 
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          noValidate
          autoComplete="off"
        >
          {/* Campo account slurm */}
          <TextField
            required
            label="Slurm account"
            name="accountSlurm"
            value={slurmData.accountSlurm}
            onChange={onDataChange}
            fullWidth
            helperText="The slurm account used for job submission"
          />

          {/* Campo nodi */}
          <TextField
            required
            label="Nodes:"
            name="nodi"
            type="number"
            value={slurmData.nodi}
            onChange={handleNumericChange}
            fullWidth
            inputProps={{ min: 1 }} // Impedisce valori minori di 1
            helperText="Number of nodes"
          />

          {/* Campo ntaskPerNode */}
          <TextField
            required
            label="ntaskPerNode:"
            name="ntaskPerNode"
            type="number"
            value={slurmData.ntaskPerNode}
            onChange={handleNumericChange}
            fullWidth
            inputProps={{ min: 1 }} // Impedisce valori minori di 1
            helperText="Number of tasks per node"
          />

          {/* Campo partition (Select) */}
          <TextField
            helperText="Select the partition to submit the job (128gb or 256gb of RAM)"
            select
            required
            label="Partition"
            name="partition"
            value={slurmData.partition}
            onChange={onDataChange}
            fullWidth
          >
            <MenuItem value="128g">128g</MenuItem>
            <MenuItem value="256g">256g</MenuItem>
          </TextField>

        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onSubmit} 
          color="primary" 
          variant="contained"
          // Disabilita il pulsante se l'account Slurm non è stato inserito
          disabled={!slurmData.accountSlurm} 
        >
         Confirm and Submit!
        </Button>
      </DialogActions>
    </Dialog>
  );
}