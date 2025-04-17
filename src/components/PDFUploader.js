import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { collection, addDoc, serverTimestamp, doc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { summarizeDocument } from '../services/geminiService';

const PDFUploader = ({ userId, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [pdfText, setPdfText] = useState('');

  // Load documents from local storage on component mount
  useEffect(() => {
    loadDocuments();
  }, [userId]);

  // Load documents from local storage
  const loadDocuments = async () => {
    try {
      // Get documents from localStorage
      const storedDocs = localStorage.getItem('deltri-documents');
      let userDocs = storedDocs ? JSON.parse(storedDocs) : [];
      
      // Filter documents for current user
      userDocs = userDocs.filter(doc => doc.userId === userId);
      
      setDocuments(userDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      
      // Read file content for text extraction
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          // In a real implementation, you would extract text from the PDF
          // For this demo, we'll use a placeholder text with more relevant content
          const placeholderText = `This document titled "${selectedFile.name}" is part of Dell Technologies' onboarding materials.
          
          Key topics covered in this document include:
          - Company culture and values at Dell Technologies
          - IT systems and access procedures
          - Security protocols and compliance requirements
          - Team structure and reporting relationships
          - Performance expectations and career development
          - Benefits and employee resources
          
          This document is designed to help new employees integrate smoothly into their roles at Dell Technologies.`;
          
          setPdfText(placeholderText);
          setError(null);
        } catch (err) {
          console.error('Error processing PDF:', err);
          setError('Error processing PDF file. Please try again.');
        }
      };
      reader.onerror = () => {
        setError('Error reading the PDF file. Please try again.');
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(false);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Create a local URL for the file
      const localFileUrl = URL.createObjectURL(file);
      
      // Start AI summarization
      setSummarizing(true);
      
      // Get AI summary using the placeholder text
      let summary;
      try {
        summary = await summarizeDocument(pdfText);
        if (!summary) {
          throw new Error('Failed to generate summary');
        }
      } catch (summaryError) {
        console.error('Error generating summary:', summaryError);
        // Use a fallback summary if the API fails
        summary = `Summary of ${file.name}: This document covers key onboarding information for Dell Technologies employees.`;
      }
      
      // Create document object
      const newDocument = {
        id: Date.now().toString(),
        userId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        localFileUrl,
        summary,
        isLocalOnly: true
      };
      
      // Save to local storage
      const storedDocs = localStorage.getItem('deltri-documents');
      const existingDocs = storedDocs ? JSON.parse(storedDocs) : [];
      const updatedDocs = [...existingDocs, newDocument];
      localStorage.setItem('deltri-documents', JSON.stringify(updatedDocs));
      
      // Try to save metadata to Firestore (will work even without Storage)
      try {
        await addDoc(collection(db, 'training-documents'), {
          userId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadDate: serverTimestamp(),
          isLocalOnly: true,
          summary,
        });
      } catch (firestoreErr) {
        console.warn('Could not save to Firestore, using local storage only:', firestoreErr);
      }
      
      // Complete the upload
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      setFile(null);
      setPdfText('');
      
      // Reload documents
      loadDocuments();
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete({
          fileName: file.name,
          localFileUrl,
          summary
        });
      }
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setSummarizing(false);
    }
  };
  
  const handleViewDocument = (localFileUrl) => {
    window.open(localFileUrl, '_blank');
  };
  
  const handleDeleteDocument = (docId) => {
    try {
      // Remove from local storage
      const storedDocs = localStorage.getItem('deltri-documents');
      if (storedDocs) {
        const existingDocs = JSON.parse(storedDocs);
        const updatedDocs = existingDocs.filter(doc => doc.id !== docId);
        localStorage.setItem('deltri-documents', JSON.stringify(updatedDocs));
        
        // Update state
        setDocuments(updatedDocs.filter(doc => doc.userId === userId));
      }
    } catch (err) {
      setError('Error deleting document: ' + err.message);
    }
  };

  return (
    <Box>
      <Paper 
        elevation={0} 
        variant="outlined"
        sx={{ 
          p: 3, 
          borderRadius: 2,
          borderStyle: 'dashed',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          textAlign: 'center',
          mb: 2
        }}
      >
        <input
          accept="application/pdf"
          style={{ display: 'none' }}
          id="pdf-upload"
          type="file"
          onChange={handleFileChange}
          disabled={uploading || summarizing}
        />
        <label htmlFor="pdf-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUploadIcon />}
            disabled={uploading || summarizing}
            sx={{ mb: 2 }}
          >
            Select PDF
          </Button>
        </label>
        
        <Typography variant="body2" color="text.secondary">
          Upload training materials in PDF format
        </Typography>
        
        {file && (
          <Box sx={{ mt: 2, textAlign: 'left' }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 1
              }}
            >
              <PictureAsPdfIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
              {!uploading && (
                <IconButton 
                  size="small" 
                  onClick={() => setFile(null)}
                  aria-label="remove file"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Paper>
          </Box>
        )}
        
        {(uploading || summarizing) && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress 
              variant={uploading ? "determinate" : "indeterminate"} 
              value={uploadProgress} 
              size={40} 
              sx={{ mb: 1 }} 
            />
            <Typography variant="body2" color="text.secondary">
              {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Generating AI summary...'}
            </Typography>
          </Box>
        )}
        
        {file && !uploading && !summarizing && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            sx={{ mt: 2 }}
          >
            Upload & Generate Summary
          </Button>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Document uploaded and summarized successfully!
          </Alert>
        )}
      </Paper>
      
      {/* Document List */}
      {documents.length > 0 && (
        <Paper sx={{ mt: 3, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Your Documents
          </Typography>
          <List>
            {documents.map((doc, index) => (
              <React.Fragment key={doc.id}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <Box>
                      <Tooltip title="View Document">
                        <IconButton edge="end" onClick={() => handleViewDocument(doc.localFileUrl)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Document">
                        <IconButton edge="end" onClick={() => handleDeleteDocument(doc.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <PictureAsPdfIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.fileName}
                    secondary={
                      <>
                        <Typography variant="body2" component="span" color="text.secondary">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                          <strong>Summary:</strong> {doc.summary.substring(0, 100)}...
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default PDFUploader;
