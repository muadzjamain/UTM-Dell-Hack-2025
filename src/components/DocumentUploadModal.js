import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography, 
  Button, 
  Box, 
  IconButton,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { auth, storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Document Upload Modal component for the Support page
 * Allows users to upload documents for HR processing
 */
const DocumentUploadModal = ({ open, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
    }
  };
  
  // Handle file removal
  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `support-documents/${user.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        // Wait for upload to complete
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                // Get download URL
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                // Save document metadata to Firestore
                await addDoc(collection(db, 'support-documents'), {
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.type,
                  downloadURL,
                  userId: user.uid,
                  uploadedAt: serverTimestamp(),
                  status: 'pending' // pending, reviewed, approved, rejected
                });
                
                resolve();
              } catch (error) {
                reject(error);
              }
            }
          );
        });
        
        // Update progress for multiple files
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      setUploadComplete(true);
      setFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
      setError(error.message || "Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  
  // Handle modal close
  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      setUploadProgress(0);
      setUploadComplete(false);
      setError(null);
      onClose();
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Upload Documents</Typography>
            <IconButton onClick={handleClose} disabled={uploading}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {uploadComplete ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Upload Complete!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your documents have been successfully uploaded and will be processed by HR.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleClose}
                sx={{ mt: 3 }}
              >
                Close
              </Button>
            </Box>
          ) : (
            <>
              {/* File Drop Area */}
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: isDragging ? 'primary.main' : 'grey.400',
                  bgcolor: isDragging ? 'primary.50' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'primary.50',
                    borderColor: 'primary.main'
                  }
                }}
                onClick={() => fileInputRef.current.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                
                <CloudUploadIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: isDragging ? 'primary.dark' : 'primary.main', 
                    mb: 2 
                  }} 
                />
                <Typography variant="h6" gutterBottom>
                  {isDragging ? 'Drop Files Here' : 'Drag & Drop Files Here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to browse files
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Supported formats: PDF, Word, Images
                </Typography>
              </Paper>
              
              {/* File List */}
              {files.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Selected Files ({files.length})
                  </Typography>
                  <List>
                    {files.map((file, index) => (
                      <ListItem 
                        key={`${file.name}-${index}`}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            onClick={() => handleRemoveFile(index)}
                            disabled={uploading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <InsertDriveFileIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={file.name} 
                          secondary={formatFileSize(file.size)} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {/* Upload Progress */}
              {uploading && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Uploading... {Math.round(uploadProgress)}%
                  </Typography>
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      size={40}
                      thickness={4}
                      sx={{ display: 'block', mx: 'auto' }}
                    />
                  </Box>
                </Box>
              )}
              
              {/* Error Message */}
              {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {error}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        
        {!uploadComplete && !uploading && (
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              Upload
            </Button>
          </DialogActions>
        )}
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      />
    </>
  );
};

export default DocumentUploadModal;
