import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  LinearProgress, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MediaUploader from '../components/MediaUploader';
import QuizGenerator from '../components/QuizGenerator';
import ChatAssistant from '../components/ChatAssistant';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const Training = () => {
  const [tabValue, setTabValue] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  
  // Fetch user data and documents on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoading(false);
          return;
        }
        
        setUserId(currentUser.uid);
        
        // Get user profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
        
        // Load documents from local storage
        loadDocumentsFromStorage(currentUser.uid);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Load documents from local storage
  const loadDocumentsFromStorage = (uid) => {
    try {
      const storedDocs = localStorage.getItem('deltri-documents');
      if (storedDocs) {
        const parsedDocs = JSON.parse(storedDocs);
        const userDocs = parsedDocs.filter(doc => doc.userId === uid);
        setUploadedDocuments(userDocs);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };
  
  // Handle document upload completion
  const handleUploadComplete = () => {
    loadDocumentsFromStorage(userId);
  };
  
  // Handle tab change in the documents section
  const handleDocumentTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Placeholder data for learning modules
  const learningModules = [
    { 
      id: 1, 
      title: 'Company Overview', 
      description: 'Learn about Dell Technologies history, mission, and values.',
      progress: 100,
      completed: true,
      type: 'video'
    },
    { 
      id: 2, 
      title: 'Security Awareness', 
      description: 'Essential security practices and protocols at Dell.',
      progress: 60,
      completed: false,
      type: 'interactive'
    },
    { 
      id: 3, 
      title: 'Product Knowledge', 
      description: "Learn about Dell's main product lines and services.",
      progress: 0,
      completed: false,
      type: 'document'
    },
  ];
  
  const learningGoals = [
    {
      id: 1,
      title: 'Complete Security Training',
      description: 'Finish all security modules and pass certification exam',
      deadline: '2025-04-30',
      progress: 60
    },
    {
      id: 2,
      title: 'Product Knowledge Certification',
      description: 'Complete product training and demonstrate proficiency',
      deadline: '2025-05-15',
      progress: 20
    },
    {
      id: 3,
      title: 'Team Integration',
      description: 'Schedule meetings with all team members and understand team workflows',
      deadline: '2025-04-25',
      progress: 80
    }
  ];
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset selected document when changing tabs
    if (newValue !== 2) {
      setSelectedDocument(null);
    }
  };
  
  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    // Switch to quiz tab
    setTabValue(2);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : !userId ? (
        <Alert severity="info" sx={{ my: 2 }}>
          Please sign in to access your training materials.
        </Alert>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Training & Learning
          </Typography>
          
          {userProfile && (
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Welcome, {userProfile.firstName}! Continue your onboarding journey below.
            </Typography>
          )}
          
          <Box sx={{ width: '100%', mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="training tabs"
            >
              <Tab icon={<SchoolIcon />} label="Learning Modules" />
              <Tab icon={<PictureAsPdfIcon />} label="Documents" />
              <Tab icon={<QuizIcon />} label="Quizzes" />
              <Tab icon={<FlagIcon />} label="Goals" />
            </Tabs>
          </Box>
          
          {/* Learning Modules Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Your Learning Path
              </Typography>
              <Typography variant="body1" paragraph>
                Complete these modules to enhance your knowledge and skills.
              </Typography>
              
              <Grid container spacing={3}>
                {learningModules.map((module) => (
                  <Grid item xs={12} md={6} lg={4} key={module.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'visible'
                      }}
                    >
                      {module.completed && (
                        <Chip 
                          icon={<CheckCircleIcon />} 
                          label="Completed" 
                          color="success" 
                          size="small"
                          sx={{ 
                            position: 'absolute', 
                            top: -10, 
                            right: -10,
                            zIndex: 1
                          }}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {module.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {module.description}
                        </Typography>
                        <Box sx={{ mt: 2, mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress: {module.progress}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={module.progress} 
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Chip 
                          label={module.type === 'video' ? 'Video' : module.type === 'interactive' ? 'Interactive' : 'Document'} 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          fullWidth
                          disabled={module.completed}
                        >
                          {module.completed ? 'Completed' : module.progress > 0 ? 'Continue' : 'Start'}
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Documents Tab */}
          {tabValue === 1 && (
            <Box>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" gutterBottom>
                    Upload Training Materials
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload training materials in PDF format, images, or capture using your camera
                  </Typography>
                  <MediaUploader userId={userId} onUploadComplete={handleUploadComplete} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" gutterBottom>
                    Your Documents
                  </Typography>
                  <Paper sx={{ p: 3, borderRadius: 2 }}>
                    {uploadedDocuments.length > 0 ? (
                      <Box>
                        <Tabs 
                          value={activeTab} 
                          onChange={handleDocumentTabChange} 
                          sx={{ mb: 2 }}
                          variant="scrollable"
                          scrollButtons="auto"
                        >
                          <Tab label="All" />
                          <Tab label="PDFs" />
                          <Tab label="Images" />
                        </Tabs>
                        
                        {activeTab === 0 && (
                          <List>
                            {uploadedDocuments.map((doc, index) => (
                              <React.Fragment key={`${doc.fileName}-${index}`}>
                                <ListItem alignItems="flex-start">
                                  <ListItemIcon>
                                    {doc.fileType === 'pdf' ? 
                                      <PictureAsPdfIcon color="error" /> : 
                                      <ImageIcon color="primary" />}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={doc.fileName}
                                    secondary={
                                      <>
                                        <Typography variant="body2" component="span" color="text.secondary">
                                          Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                                        </Typography>
                                        {doc.summary && (
                                          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                                            <strong>Summary:</strong> {doc.summary}
                                          </Typography>
                                        )}
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
                                      </>
                                    }
                                  />
                                  <Button 
                                    variant="outlined" 
                                    color="primary"
                                    size="small"
                                    onClick={() => handleDocumentSelect(doc)}
                                    startIcon={<QuizIcon />}
                                    sx={{ mt: 1 }}
                                  >
                                    Generate Quiz
                                  </Button>
                                </ListItem>
                                <Divider component="li" />
                              </React.Fragment>
                            ))}
                          </List>
                        )}
                        
                        {activeTab === 1 && (
                          <List>
                            {uploadedDocuments
                              .filter(doc => doc.fileType === 'pdf')
                              .map((doc, index) => (
                                <React.Fragment key={`pdf-${doc.fileName}-${index}`}>
                                  <ListItem alignItems="flex-start">
                                    <ListItemIcon>
                                      <PictureAsPdfIcon color="error" />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={doc.fileName}
                                      secondary={
                                        <>
                                          <Typography variant="body2" component="span" color="text.secondary">
                                            Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                                          </Typography>
                                          {doc.summary && (
                                            <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                                              <strong>Summary:</strong> {doc.summary}
                                            </Typography>
                                          )}
                                        </>
                                      }
                                    />
                                    <Button 
                                      variant="outlined" 
                                      color="primary"
                                      size="small"
                                      onClick={() => handleDocumentSelect(doc)}
                                      startIcon={<QuizIcon />}
                                      sx={{ mt: 1 }}
                                    >
                                      Generate Quiz
                                    </Button>
                                  </ListItem>
                                  <Divider component="li" />
                                </React.Fragment>
                              ))}
                          </List>
                        )}
                        
                        {activeTab === 2 && (
                          <Box>
                            {uploadedDocuments.filter(doc => doc.fileType === 'image' || doc.fileType === 'camera').length > 0 ? (
                              <ImageList cols={2} gap={8}>
                                {uploadedDocuments
                                  .filter(doc => doc.fileType === 'image' || doc.fileType === 'camera')
                                  .map((doc, index) => (
                                    <ImageListItem key={`img-${doc.fileName}-${index}`}>
                                      <img
                                        src={doc.previewUrl}
                                        alt={doc.fileName}
                                        style={{ borderRadius: 8, objectFit: 'cover', height: 200 }}
                                        loading="lazy"
                                      />
                                      <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2" noWrap>
                                          {doc.fileName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {new Date(doc.uploadDate).toLocaleDateString()}
                                        </Typography>
                                      </Box>
                                    </ImageListItem>
                                  ))}
                              </ImageList>
                            ) : (
                              <Typography variant="body1" color="text.secondary">
                                No images uploaded yet.
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        No documents uploaded yet. Upload your first document to get started.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Quizzes Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Knowledge Assessment
              </Typography>
              
              {selectedDocument ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="subtitle1">
                      Generate a quiz based on your uploaded document
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setSelectedDocument(null)}
                    >
                      Choose Different Document
                    </Button>
                  </Box>
                  
                  <QuizGenerator 
                    documentContent={selectedDocument.content || selectedDocument.summary} 
                    documentTitle={selectedDocument.fileName} 
                    documentType={selectedDocument.fileType}
                  />
                </>
              ) : (
                <>
                  <Typography variant="body1" paragraph>
                    Test your understanding of the training materials with these quizzes.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Company Overview Quiz
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Test your knowledge about Dell's history, mission, and values.
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <QuizIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              10 questions • Approx. 15 minutes
                            </Typography>
                          </Box>
                        </CardContent>
                        <Box sx={{ p: 2, pt: 0 }}>
                          <Button variant="contained" color="primary" fullWidth>
                            Start Quiz
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Security Awareness Quiz
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Test your understanding of security protocols and best practices.
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <QuizIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              8 questions • Approx. 12 minutes
                            </Typography>
                          </Box>
                        </CardContent>
                        <Box sx={{ p: 2, pt: 0 }}>
                          <Button variant="contained" color="primary" fullWidth>
                            Start Quiz
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, mt: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <AssignmentIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              Document-Based Quizzes
                            </Typography>
                            <Typography variant="body2" paragraph>
                              Generate custom quizzes based on your uploaded training documents. Our AI will create relevant questions to test your understanding.
                            </Typography>
                            <Button 
                              variant="contained" 
                              color="primary"
                              onClick={() => setTabValue(1)}
                            >
                              Go to Documents
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          )}
          
          {/* Learning Goals Tab */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h5" gutterBottom>Your Learning Goals</Typography>
              <Typography variant="body1" paragraph>
                Track your personal learning goals with AI-generated suggestions.
              </Typography>
              
              <Grid container spacing={3}>
                {learningGoals.map((goal) => (
                  <Grid item xs={12} md={4} key={goal.id}>
                    <Card sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{goal.title}</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {goal.description}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Deadline: {goal.deadline}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Box sx={{ flexGrow: 1, mr: 2 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={goal.progress} 
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {goal.progress}%
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button fullWidth variant="outlined" size="small">
                          Update Progress
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Training;
