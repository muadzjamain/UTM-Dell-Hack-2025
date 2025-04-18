import React, { useState, useRef, useCallback } from 'react';
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
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';

/**
 * Document Upload Modal component that allows users to upload documents
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Function to call when closing the modal
 */
const DocumentUploadModal = ({ open, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // Handle file selection from file input
  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }
  };
  
  // Handle drag enter event
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  // Handle drag over event
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);
  
  // Handle drag leave event
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if we're leaving the drop area (not a child element)
    if (e.currentTarget === dropAreaRef.current) {
      setIsDragging(false);
    }
  }, []);
  
  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
    }
  }, []);

  // Handle file removal
  const handleFileRemove = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Handle document type change
  const handleDocumentTypeChange = (event) => {
    setDocumentType(event.target.value);
  };

  // Handle description change
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  // Get icon based on file type
  const getFileIcon = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) {
      return <PictureAsPdfIcon color="error" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
      return <ImageIcon color="primary" />;
    } else if (['doc', 'docx'].includes(extension)) {
      return <DescriptionIcon color="primary" />;
    } else {
      return <InsertDriveFileIcon color="action" />;
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

  // Handle upload
  const handleUpload = () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setUploading(false);
      setUploadComplete(true);
    }, 2000);
  };

  // Handle modal close
  const handleClose = () => {
    // Reset state if modal is closed
    if (!uploading) {
      setFiles([]);
      setUploadComplete(false);
      setDocumentType('');
      setDescription('');
      setIsDragging(false);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      className="modal-enter"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <DialogTitle 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.light' }}>
            <CloudUploadIcon />
          </Avatar>
          <Typography variant="h6">Document Upload</Typography>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={handleClose} 
          aria-label="close"
          disabled={uploading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {uploadComplete ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>Upload Complete!</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your document{files.length > 1 ? 's have' : ' has'} been successfully uploaded and sent to Dell's HR/manager for review.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You will be notified once the document{files.length > 1 ? 's are' : ' is'} reviewed.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 3 }}
              onClick={handleClose}
            >
              Close
            </Button>
          </Box>
        ) : (
          <>
            {/* Document Type Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="document-type-label">Document Type</InputLabel>
              <Select
                labelId="document-type-label"
                id="document-type"
                value={documentType}
                label="Document Type"
                onChange={handleDocumentTypeChange}
                disabled={uploading}
              >
                <MenuItem value="certification">Certification</MenuItem>
                <MenuItem value="training">Training Completion</MenuItem>
                <MenuItem value="identification">Identification Document</MenuItem>
                <MenuItem value="tax">Tax Document</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={description}
              onChange={handleDescriptionChange}
              sx={{ mb: 3 }}
              disabled={uploading}
            />
            
            {/* File Upload Area */}
            {files.length === 0 ? (
              <Paper
                ref={dropAreaRef}
                variant="outlined"
                sx={{
                  p: 5,
                  textAlign: 'center',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: isDragging ? 'primary.main' : 'primary.light',
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
                  disabled={uploading}
                />
                <CloudUploadIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: isDragging ? 'primary.dark' : 'primary.main', 
                    mb: 2,
                    transform: isDragging ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }} 
                />
                <Typography variant="h6" gutterBottom>
                  {isDragging ? 'Drop Files Here' : 'Drag & Drop Files Here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to browse files
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Supported formats: PDF, Word, Excel, Images
                </Typography>
              </Paper>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">Selected Files</Typography>
                  <Button 
                    size="small" 
                    startIcon={<CloudUploadIcon />}
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                  >
                    Add More
                  </Button>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                </Box>
                
                <Paper variant="outlined" sx={{ mb: 3 }}>
                  <List sx={{ p: 0 }}>
                    {files.map((file, index) => (
                      <React.Fragment key={index}>
                        <ListItem
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              aria-label="delete" 
                              onClick={() => handleFileRemove(index)}
                              disabled={uploading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemIcon>
                            {getFileIcon(file)}
                          </ListItemIcon>
                          <ListItemText 
                            primary={file.name} 
                            secondary={formatFileSize(file.size)} 
                          />
                        </ListItem>
                        {index < files.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Note</AlertTitle>
                  Files will be uploaded securely and will only be accessible to authorized Dell personnel.
                </Alert>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      
      {!uploadComplete && (
        <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Button 
            onClick={handleClose} 
            color="inherit"
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            onClick={handleUpload}
            disabled={files.length === 0 || uploading || !documentType}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default DocumentUploadModal;
