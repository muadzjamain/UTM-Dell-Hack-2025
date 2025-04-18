import React, { useState, useEffect, useRef } from 'react';
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
  Tooltip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { collection, addDoc, serverTimestamp, doc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { summarizeDocument } from '../services/geminiService';

const MediaUploader = ({ userId, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'pdf', 'image', 'camera'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [fileContent, setFileContent] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploadTabValue, setUploadTabValue] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Load documents from local storage on component mount
  useEffect(() => {
    loadDocuments();
    return () => {
      // Clean up camera stream when component unmounts
      stopCameraStream();
    };
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

  const handleTabChange = (event, newValue) => {
    setUploadTabValue(newValue);
    // Reset state when changing tabs
    setFile(null);
    setFileType(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file type
    if (uploadTabValue === 0 && selectedFile.type === 'application/pdf') {
      // PDF upload
      handlePdfSelection(selectedFile);
    } else if (uploadTabValue === 1 && selectedFile.type.startsWith('image/')) {
      // Image upload
      handleImageSelection(selectedFile);
    } else {
      setFile(null);
      setFileType(null);
      setPreviewUrl(null);
      setError(`Please select a valid ${uploadTabValue === 0 ? 'PDF' : 'image'} file`);
    }
  };

  const handlePdfSelection = (selectedFile) => {
    setFile(selectedFile);
    setFileType('pdf');
    setError(null);
    
    // Read file content for text extraction
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        // In a real implementation, you would extract text from the PDF
        // For this demo, we'll use a placeholder text with more relevant content
        // But we'll make it more specific to the filename to help with quiz generation
        let placeholderText = '';
        
        if (selectedFile.name.toLowerCase().includes('logic') || selectedFile.name.toLowerCase().includes('fully')) {
          placeholderText = `Logic and Programming Fundamentals
          
          This document covers essential concepts in logic and programming fundamentals.
          
          Key topics covered:
          
          1. Introduction to Logic in Programming
          Logic is the foundation of all programming and computational thinking. This document explores the relationship between formal logic systems and programming constructs.
          
          2. Types of Logic Systems
          - Propositional Logic: Deals with propositions and logical operators (AND, OR, NOT)
          - Predicate Logic: Extends propositional logic with quantifiers and predicates
          - Fuzzy Logic: Handles degrees of truth rather than binary true/false values
          
          3. Logic Gates and Digital Circuits
          The document explains how basic logic gates (AND, OR, NOT, XOR, NAND, NOR) form the building blocks of digital circuits and computer processors.
          
          4. Boolean Algebra
          Boolean algebra provides the mathematical foundation for logical operations in computing. Key laws covered include:
          - Commutative Law: A AND B = B AND A
          - Associative Law: A AND (B AND C) = (A AND B) AND C
          - Distributive Law: A AND (B OR C) = (A AND B) OR (A AND C)
          - De Morgan's Laws: NOT(A AND B) = NOT A OR NOT B
          
          5. Logic in Programming Languages
          The document explores how logical constructs are implemented in various programming languages through:
          - Conditional statements (if-then-else)
          - Logical operators (&&, ||, !)
          - Control flow structures
          - Truth tables and evaluation order
          
          6. Common Logical Fallacies in Programming
          - Off-by-one errors
          - Improper boolean evaluations
          - Confusion between AND and OR conditions
          - Short-circuit evaluation issues
          
          This document is essential for understanding the theoretical foundations of computer science and programming logic.`;
        } else if (selectedFile.name.toLowerCase().includes('clustering')) {
          placeholderText = `Dell Technologies Clustering Documentation
          
          This document provides a comprehensive overview of clustering technologies used at Dell Technologies. 
          
          Key topics covered:
          
          1. Introduction to Clustering
          Clustering is the process of connecting multiple servers together to work as a single system. At Dell Technologies, we implement clustering to provide high availability, load balancing, and scalability for critical business applications.
          
          2. Types of Clusters Used at Dell
          - High-Availability (HA) Clusters: Designed to maintain service availability by eliminating single points of failure
          - Load-Balancing Clusters: Distribute workload across multiple servers to optimize resource utilization
          - Compute Clusters: Used for high-performance computing tasks and data processing
          
          3. Dell's Clustering Architecture
          Our clustering architecture consists of multiple nodes connected through redundant network paths. Each node contains its own processing resources but shares storage and network infrastructure. This design ensures that if one node fails, others can take over its workload seamlessly.
          
          4. Implementation Guidelines
          When implementing clusters at Dell Technologies, engineers should follow these best practices:
          - Always configure at least N+1 redundancy
          - Implement separate heartbeat networks
          - Use shared storage solutions like Dell EMC PowerStore
          - Configure automatic failover policies
          
          5. Troubleshooting Cluster Issues
          Common issues include split-brain scenarios, resource contention, and network partition events. The document outlines specific diagnostic procedures and resolution steps for each scenario.
          
          This document is designed to help new Dell employees understand our clustering technologies and implement them correctly in production environments.`;
        } else if (selectedFile.name.toLowerCase().includes('security')) {
          placeholderText = `Dell Technologies Security Protocols
          
          This document outlines the essential security practices and protocols all Dell employees must follow.
          
          Key security requirements:
          
          1. Authentication and Access Control
          - All employees must use multi-factor authentication (MFA) for accessing Dell systems
          - Password requirements: minimum 12 characters, combination of uppercase, lowercase, numbers, and special characters
          - Passwords must be changed every 90 days and cannot be reused for 12 cycles
          
          2. Data Protection
          - All sensitive data must be encrypted both at rest and in transit
          - Dell classifies data into four categories: Public, Internal, Confidential, and Restricted
          - Different handling procedures apply to each data classification
          
          3. Device Security
          - All Dell-issued devices must have approved endpoint protection software installed
          - Full disk encryption is mandatory for all laptops and mobile devices
          - Automatic screen locking must be enabled after 5 minutes of inactivity
          
          4. Incident Response
          - Security incidents must be reported to the Security Operations Center within 1 hour of discovery
          - The incident response team follows a 5-step process: Identify, Contain, Eradicate, Recover, and Learn
          
          5. Compliance Requirements
          - Dell Technologies adheres to multiple regulatory frameworks including SOX, GDPR, and ISO 27001
          - Annual security awareness training is mandatory for all employees
          
          This document is essential reading for all Dell employees to ensure compliance with company security policies and to protect our systems and data.`;
        } else {
          placeholderText = `Dell Technologies Onboarding Document: ${selectedFile.name}
          
          This document is part of Dell Technologies' comprehensive onboarding program for new employees.
          
          Key topics covered in this document include:
          
          1. Company Culture and Values
          Dell Technologies is built on a foundation of key values including customer focus, innovation, integrity, and teamwork. Our culture emphasizes collaboration, diversity, and continuous learning.
          
          2. Organizational Structure
          The company is organized into several business units including Infrastructure Solutions Group, Client Solutions Group, and VMware. Each new employee is assigned to a specific business unit with clear reporting relationships.
          
          3. IT Systems and Access
          New employees receive access to essential systems including:
          - Dell Digital Workspace for email and collaboration
          - ServiceNow for IT support and requests
          - Workday for HR functions and time tracking
          - Learning Management System for training and development
          
          4. Performance Management
          Dell uses a continuous performance management approach with quarterly check-ins and annual reviews. Employees set SMART goals aligned with team and company objectives.
          
          5. Career Development Opportunities
          Dell offers multiple paths for career advancement including technical tracks, management tracks, and lateral moves across functions. Employees are encouraged to create Individual Development Plans (IDPs).
          
          6. Benefits and Resources
          Comprehensive benefits include healthcare options, retirement plans, employee stock purchase program, and various wellbeing resources. The Connected Workplace program offers flexibility in work arrangements.
          
          This document is designed to help new employees integrate smoothly into their roles at Dell Technologies and understand the resources available to them.`;
        }
        
        setFileContent(placeholderText);
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
  };

  const handleImageSelection = (selectedFile) => {
    setFile(selectedFile);
    setFileType('image');
    setError(null);
    
    // Create preview URL
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(imageUrl);
    
    // Generate placeholder text for the image based on filename
    let placeholderText = '';
    
    if (selectedFile.name.toLowerCase().includes('badge') || selectedFile.name.toLowerCase().includes('id')) {
      placeholderText = `Dell Technologies Employee Badge Information
      
      This image shows the Dell Technologies employee identification badge design and requirements.
      
      Key information visible in this image:
      
      1. Badge Components
      - Employee photo must be clearly visible against a white background
      - Employee name and ID number are printed on the front
      - Department color coding appears on the left side (Blue: Engineering, Green: Sales, Purple: Operations)
      - QR code in the bottom right links to the employee's digital profile
      
      2. Badge Usage Requirements
      - Badges must be visibly worn at all times while on Dell premises
      - Badges provide access to specific areas based on job role and clearance level
      - Lost or stolen badges must be reported immediately to security
      - Temporary badges are valid for only 24 hours
      
      3. Security Features
      - Holographic Dell logo overlay prevents counterfeiting
      - RFID chip embedded for contactless access control
      - Badges expire automatically after one year and require renewal
      
      This image is part of the security orientation for new Dell employees.`;
    } else if (selectedFile.name.toLowerCase().includes('office') || selectedFile.name.toLowerCase().includes('layout')) {
      placeholderText = `Dell Technologies Office Layout Guide
      
      This image shows the standard office layout for Dell Technologies facilities.
      
      Key elements visible in this floor plan:
      
      1. Workspace Zones
      - Collaboration areas with shared tables and whiteboards (blue sections)
      - Focus zones for quiet, concentrated work (green sections)
      - Meeting rooms of various sizes (yellow sections)
      - Social spaces including café and break areas (orange sections)
      
      2. Navigation Guidelines
      - Main walkways are indicated with gray paths
      - Emergency exits are marked with red symbols
      - Elevator banks and stairwells are located at building corners
      - Reception and security checkpoints at main entrances
      
      3. Resource Locations
      - Printer stations marked with printer icons
      - IT help desk located near central area
      - Supply closets adjacent to printer stations
      - Wellness rooms available on each floor
      
      This image helps new employees navigate Dell facilities and understand the different workspace options available to them.`;
    } else {
      placeholderText = `Dell Technologies Visual Documentation: ${selectedFile.name}
      
      This image has been uploaded as part of Dell Technologies' onboarding materials.
      
      The image appears to contain important visual information related to Dell's operations and procedures.
      
      Visible elements may include:
      - Organizational charts showing team structures and reporting relationships
      - Process flow diagrams illustrating standard workflows
      - Product documentation with technical specifications
      - Training materials with step-by-step visual instructions
      - Branding guidelines showing proper logo usage and color specifications
      - Security procedures with visual examples of compliance requirements
      
      Visual documentation is an essential component of Dell's onboarding process, helping new employees quickly understand complex information through clear graphical representation.`;
    }
    
    setFileContent(placeholderText);
  };

  const startCamera = async () => {
    try {
      setCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions and try again.');
      setCameraOpen(false);
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a file from the blob
          const timestamp = new Date().toISOString();
          const capturedFile = new File([blob], `workspace-verification-${timestamp}.jpg`, { type: 'image/jpeg' });
          
          // Create preview URL
          const imageUrl = URL.createObjectURL(blob);
          setPreviewUrl(imageUrl);
          
          // Set file and file type
          setFile(capturedFile);
          setFileType('camera');
          
          // Generate detailed placeholder text for the captured image
          const placeholderText = `Dell Technologies Workspace Verification Image
          
          This image was captured on ${new Date().toLocaleDateString()} as part of Dell Technologies' onboarding verification process.
          
          Purpose of this documentation:
          
          1. Workspace Compliance Verification
          This image documents the employee's workspace setup to ensure compliance with Dell's ergonomic and security standards. The workspace should include:
          - Adjustable chair with proper lumbar support
          - Monitor positioned at eye level and arm's length away
          - Keyboard and mouse placed to maintain neutral wrist position
          - Adequate lighting without screen glare
          
          2. Equipment Verification
          The image shows the Dell-issued equipment provided to the employee, which should include:
          - Dell laptop model [Latitude/XPS/Precision] with docking station
          - Dual monitors with proper cable management
          - Dell wireless keyboard and mouse
          - Headset for virtual meetings
          
          3. Security Compliance
          The image demonstrates adherence to Dell security protocols:
          - Privacy screen filter on monitors when working in public spaces
          - No confidential information visible on screens
          - ID badge properly displayed
          - Clean desk policy implementation with secure storage for documents
          
          This documentation is required for all remote and hybrid employees to ensure proper setup and compliance with Dell Technologies' workspace standards.`;
          
          setFileContent(placeholderText);
          
          // Close camera dialog
          setCameraOpen(false);
          stopCameraStream();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 300);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create document metadata
      const docData = {
        userId,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        content: fileContent,
        summary: '',
        previewUrl: previewUrl // Store preview URL for images and camera captures
      };
      
      // In a real implementation, you would upload to Firebase Storage
      // For this demo, we'll just store in localStorage
      const storedDocs = localStorage.getItem('deltri-documents') || '[]';
      const parsedDocs = JSON.parse(storedDocs);
      parsedDocs.push(docData);
      localStorage.setItem('deltri-documents', JSON.stringify(parsedDocs));
      
      // Clear interval and set success
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      setUploading(false);
      
      // Generate summary if it's a PDF
      if (fileType === 'pdf') {
        setSummarizing(true);
        try {
          // In a real implementation, you would use the Gemini API to summarize the document
          // For this demo, we'll use a placeholder summary
          const summary = `This document provides essential information for new Dell employees.
          
          Summary:
          - Introduces Dell's core values: customer focus, innovation, and teamwork
          - Explains IT system access procedures and security protocols
          - Outlines the organizational structure and reporting relationships
          - Details performance expectations and career development opportunities
          - Provides information about employee benefits and resources
          
          This document is a key resource for understanding Dell's culture and procedures.`;
          
          // Update document with summary
          const updatedDocs = JSON.parse(localStorage.getItem('deltri-documents'));
          const docIndex = updatedDocs.findIndex(doc => doc.fileName === file.name && doc.userId === userId);
          if (docIndex !== -1) {
            updatedDocs[docIndex].summary = summary;
            localStorage.setItem('deltri-documents', JSON.stringify(updatedDocs));
          }
        } catch (err) {
          console.error('Error generating summary:', err);
        } finally {
          setSummarizing(false);
        }
      }
      
      // Reload documents and notify parent
      loadDocuments();
      if (onUploadComplete) {
        onUploadComplete();
      }
      
      // Reset state
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        setFileType(null);
        setPreviewUrl(null);
        setFileContent('');
      }, 3000);
      
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Error uploading file. Please try again.');
      setUploading(false);
    }
  };

  const handleDeleteDocument = (fileName) => {
    try {
      // Get documents from localStorage
      const storedDocs = localStorage.getItem('deltri-documents');
      if (storedDocs) {
        let parsedDocs = JSON.parse(storedDocs);
        
        // Filter out the document to delete
        parsedDocs = parsedDocs.filter(doc => !(doc.fileName === fileName && doc.userId === userId));
        
        // Save updated documents
        localStorage.setItem('deltri-documents', JSON.stringify(parsedDocs));
        
        // Update state
        setDocuments(parsedDocs.filter(doc => doc.userId === userId));
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleViewDocument = (document) => {
    // In a real implementation, you would open the document in a viewer
    // For this demo, we'll just log the document details
    console.log('Viewing document:', document);
    
    // You could implement a modal to display the document content here
    alert(`Document: ${document.fileName}\n\nContent: ${document.content}\n\nSummary: ${document.summary || 'No summary available'}`);
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <PictureAsPdfIcon color="error" />;
      case 'image':
      case 'camera':
        return <ImageIcon color="primary" />;
      default:
        return <PictureAsPdfIcon />;
    }
  };

  const renderUploadTab = () => {
    switch (uploadTabValue) {
      case 0: // PDF
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => fileInputRef.current.click()}
              sx={{ mb: 2 }}
            >
              Select PDF
            </Button>
            {file && fileType === 'pdf' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 1: // Image
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => fileInputRef.current.click()}
              sx={{ mb: 2, mr: 2 }}
            >
              Select Image
            </Button>
            {file && fileType === 'image' && previewUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </Typography>
                <Box sx={{ maxWidth: 300, mx: 'auto', mt: 2 }}>
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', borderRadius: 8 }} />
                </Box>
              </Box>
            )}
          </Box>
        );
      case 2: // Camera
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Button
              variant="outlined"
              startIcon={<CameraAltIcon />}
              onClick={startCamera}
              sx={{ mb: 2 }}
            >
              Capture Image
            </Button>
            {file && fileType === 'camera' && previewUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Captured image: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </Typography>
                <Box sx={{ maxWidth: 300, mx: 'auto', mt: 2 }}>
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', borderRadius: 8 }} />
                </Box>
              </Box>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Training Materials
        </Typography>
        
        <Tabs
          value={uploadTabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab icon={<PictureAsPdfIcon />} label="PDF" />
          <Tab icon={<ImageIcon />} label="Image" />
          <Tab icon={<CameraAltIcon />} label="Camera" />
        </Tabs>
        
        {renderUploadTab()}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            File uploaded successfully!
          </Alert>
        )}
        
        {uploading && (
          <Box sx={{ mt: 2 }}>
            <CircularProgress 
              variant="determinate" 
              value={uploadProgress} 
              size={24} 
              sx={{ mr: 1 }} 
            />
            <Typography variant="body2" component="span">
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}
        
        {summarizing && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography variant="body2">
              Generating summary...
            </Typography>
          </Box>
        )}
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<CloudUploadIcon />}
          onClick={handleUpload}
          disabled={!file || uploading || summarizing}
          sx={{ mt: 2 }}
          fullWidth
        >
          Upload
        </Button>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {uploadTabValue === 0 ? 
            'Upload training materials in PDF format' : 
            uploadTabValue === 1 ? 
              'Upload images related to your training' : 
              'Capture images using your device camera'}
        </Typography>
      </Paper>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        Your Documents
      </Typography>
      
      {documents.length === 0 ? (
        <Alert severity="info">
          No documents uploaded yet. Upload your first document to get started.
        </Alert>
      ) : (
        <List>
          {documents.map((doc, index) => (
            <React.Fragment key={`${doc.fileName}-${index}`}>
              <ListItem
                secondaryAction={
                  <Box>
                    <Tooltip title="View Document">
                      <IconButton edge="end" onClick={() => handleViewDocument(doc)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Document">
                      <IconButton edge="end" onClick={() => handleDeleteDocument(doc.fileName)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemIcon>
                  {getFileIcon(doc.fileType)}
                </ListItemIcon>
                <ListItemText
                  primary={doc.fileName}
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" component="span" color="text.secondary">
                        {new Date(doc.uploadDate).toLocaleString()} • {(doc.fileSize / 1024).toFixed(2)} KB
                      </Typography>
                      {doc.previewUrl && doc.fileType !== 'pdf' && (
                        <Box sx={{ mt: 1 }}>
                          <img 
                            src={doc.previewUrl} 
                            alt="Preview" 
                            style={{ 
                              width: 100, 
                              height: 100, 
                              objectFit: 'cover', 
                              borderRadius: 4 
                            }} 
                          />
                        </Box>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < documents.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
      
      {/* Camera Dialog */}
      <Dialog 
        open={cameraOpen} 
        onClose={() => {
          setCameraOpen(false);
          stopCameraStream();
        }}
        maxWidth="md"
      >
        <DialogTitle>Capture Image</DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 640 }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              style={{ width: '100%', borderRadius: 8 }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setCameraOpen(false);
              stopCameraStream();
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={captureImage}
          >
            Capture
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaUploader;
