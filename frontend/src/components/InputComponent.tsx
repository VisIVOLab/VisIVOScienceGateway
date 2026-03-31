import React from 'react';
import { 
  Box, Typography, Paper, Alert, Button, FormControl, RadioGroup, 
  FormControlLabel, Radio, List, ListItem, ListItemText, IconButton, 
  Divider, Chip, CircularProgress 
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Definiamo le interfacce per i dati
interface PendingFile {
  id: string;
  file: File;
  type: 'input' | 'yml';
}

interface UploadedFile {
  name: string;
  type: string;
}

interface ConfigRunInputsProps {
  projectType: number;
  missingRequirements: Record<string, string>;
  tempFile: File | null;
  fileCategory: 'input' | 'yml';
  setFileCategory: (val: 'input' | 'yml') => void;
  pendingFiles: PendingFile[];
  uploadedFilesList: UploadedFile[];
  isUploading: boolean;
  isUploading_r: boolean; // quello usato per il pulsante upload all
  handleFileSelection: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddToPending: () => void;
  handleRemovePending: (id: string) => void;
  handleUploadAll: () => void;
  handleBack: () => void;
  handleInitialSubmit:(e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ConfigRunInputs: React.FC<ConfigRunInputsProps> = ({
  projectType,
  missingRequirements,
  tempFile,
  fileCategory,
  setFileCategory,
  pendingFiles,
  uploadedFilesList,
  isUploading,
  isUploading_r,
  handleFileSelection,
  handleAddToPending,
  handleRemovePending,
  handleUploadAll,
  handleBack,
  handleInitialSubmit
}) => {
  return (
    <Box>
      <Typography variant="h4" component="span" mb={3} display="block">
        Configure Run Inputs
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Sezione Requisiti */}
        {Object.keys(missingRequirements).length > 0 && (
          <Alert severity="info" sx={{ mb: 3, '& .MuiAlert-message': { width: '100%' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Required Inputs from CWL:
            </Typography>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              {Object.entries(missingRequirements).map(([reqName, reqType]) => (
                <li key={reqName}>
                  <Typography variant="body2">
                    <strong>{reqName}</strong> <span style={{ opacity: 0.7 }}>({reqType})</span>
                  </Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Area Upload */}
        <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f0f7ff', borderColor: '#badef9', mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Upload File
          </Typography>
          
          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <Button variant="outlined" component="label" disabled={isUploading}>
              Choose File
              <input
                type="file"
                hidden
                onChange={handleFileSelection}
                onClick={(e) => ((e.target as HTMLInputElement).value = '')} 
              />
            </Button>

            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography 
                variant="body2" 
                noWrap 
                sx={{ 
                  fontStyle: tempFile ? 'normal' : 'italic', 
                  fontWeight: tempFile ? 'bold' : 'normal' 
                }}
              >
                {tempFile ? tempFile.name : "No file selected"}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <FormControl component="fieldset" disabled={isUploading}>
              <RadioGroup
                row
                value={fileCategory}
                onChange={(e) => setFileCategory(e.target.value as 'input' | 'yml')}
              >
                <FormControlLabel 
                  value="input" 
                  control={<Radio size="small" />} 
                  label={<Typography variant="body2">Input Data</Typography>} 
                />
                {projectType === 1 && (
                  <FormControlLabel 
                  value="yml" 
                  control={<Radio size="small" />} 
                  label={<Typography variant="body2">YML Config</Typography>} 
                />)}
                
              </RadioGroup>
            </FormControl>

            <Button 
              variant="contained" 
              onClick={handleAddToPending}
              disabled={!tempFile || isUploading}
              startIcon={<AddIcon />}
              size="small"
            >
              Add
            </Button>
          </Box>
        </Paper>

        {/* Coda File Pendenti */}
        {pendingFiles.length > 0 && (
          <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#fffbf0', borderColor: '#ffe69c' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2">
                Files Ready to Upload ({pendingFiles.length}):
              </Typography>

              <Button
                variant="contained"
                onClick={handleUploadAll}
                disabled={isUploading_r}
                startIcon={isUploading_r ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                size="small"
              >
                {isUploading_r ? "Uploading..." : `Upload All (${pendingFiles.length})`}
              </Button>
            </Box>

            <List dense sx={{ bgcolor: 'white', borderRadius: 1 }}>
              {pendingFiles.map((fileObj, index) => (
                <React.Fragment key={fileObj.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemovePending(fileObj.id)}
                        disabled={isUploading_r}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={fileObj.file.name}
                      secondary={
                        <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                          <Chip
                            label={fileObj.type === 'yml' ? 'YML Config' : 'Input Data'}
                            size="small"
                            color={fileObj.type === 'yml' ? 'primary' : 'default'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {(fileObj.file.size / 1024).toFixed(2)} KB
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index !== pendingFiles.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {/* Lista File Caricati */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" fontSize="small" />
            Uploaded Files ({uploadedFilesList.length}):
          </Typography>
          
          {uploadedFilesList.length > 0 ? (
            <List dense sx={{ bgcolor: '#f5f5f5', borderRadius: 1, maxHeight: 150, overflow: 'auto' }}>
              {uploadedFilesList.map((fileObj, index) => (
                <ListItem key={index} divider={index !== uploadedFilesList.length - 1}>
                  <ListItemText 
                    primary={fileObj.name} 
                    secondary={`Category: ${fileObj.type === 'yml' ? 'YML Config' : 'Input Data'}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No files uploaded yet.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Pulsanti Azione Finali */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={handleBack}>
          Back to Project
        </Button>
        <Button 
          variant="contained" 
          onClick={handleInitialSubmit}
          disabled={uploadedFilesList.length === 0}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};