import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  LinearProgress, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Divider,
  Avatar,
  Paper,
  Stack,
  CircularProgress,
  TextField,
  IconButton
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessIcon from '@mui/icons-material/Business';
import PolicyIcon from '@mui/icons-material/Policy';
import FlagIcon from '@mui/icons-material/Flag';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import Draggable from 'react-draggable';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDellAssistantResponse } from '../services/geminiService';

const Dashboard = () => {
  const navigate = useNavigate();
  const nodeRef = useRef(null);
  
  // State for user profile data
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for chatbot widget
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: "Hi there! I'm your Dell onboarding assistant. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoading(false);
          setError('Please sign in to view your dashboard');
          return;
        }
        
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          // Extract name from email if possible
          const emailName = currentUser.email ? currentUser.email.split('@')[0] : '';
          const nameParts = emailName.split('.');
          const firstName = nameParts.length > 0 ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : '';
          const lastName = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : '';
          
          // Create a personalized fallback profile
          const fallbackProfile = {
            firstName: firstName || currentUser.displayName?.split(' ')[0] || 'User',
            lastName: lastName || currentUser.displayName?.split(' ')[1] || '',
            email: currentUser.email,
            role: 'Employee',
            department: 'Dell Technologies',
            startDate: new Date().toISOString().split('T')[0], // Today's date
            onboardingStatus: 'In Progress'
          };
          
          // Save this fallback profile to Firestore for future use
          try {
            await setDoc(doc(db, 'users', currentUser.uid), fallbackProfile);
          } catch (saveErr) {
            console.warn('Could not save fallback profile to Firestore:', saveErr);
          }
          
          setUserProfile(fallbackProfile);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const currentTask = 'Complete HR Training';
  const modules = [
    { 
      id: 1,
      title: 'Company Overview', 
      description: 'Learn about Dell Technologies history, mission, and values.',
      progress: 5, 
      total: 5, 
      status: 'completed',
      icon: <BusinessIcon />
    },
    { 
      id: 2,
      title: 'Security Awareness', 
      description: 'Essential security practices and protocols at Dell.',
      progress: 3, 
      total: 5, 
      status: 'in-progress',
      icon: <PolicyIcon />
    },
    { 
      id: 3,
      title: 'Compliance', 
      description: 'Understanding corporate policies and legal requirements.',
      progress: 1, 
      total: 5, 
      status: 'not-started',
      icon: <FlagIcon />
    },
    { 
      id: 4,
      title: 'Technical Onboarding', 
      description: 'Technical training specific to your role and team.',
      progress: 0, 
      total: 5, 
      status: 'not-started',
      icon: <SchoolIcon />
    },
  ];
  
  // Calculate days since onboarding started
  const calculateDaysSinceStart = () => {
    if (!userProfile?.startDate) return 1; // Default to 1 day if no start date
    
    try {
      const startDate = new Date(userProfile.startDate);
      const today = new Date();
      
      // Check if startDate is valid
      if (isNaN(startDate.getTime())) {
        console.warn('Invalid start date:', userProfile.startDate);
        return 1; // Default to 1 day if invalid date
      }
      
      const diffTime = Math.abs(today - startDate);
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Ensure we return at least 1 day
      return Math.max(1, days);
    } catch (error) {
      console.error('Error calculating days since start:', error);
      return 1; // Default to 1 day on error
    }
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'not-started': return 'default';
      default: return 'default';
    }
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircleIcon fontSize="small" />;
      case 'in-progress': return <AccessTimeIcon fontSize="small" />;
      case 'not-started': return null;
      default: return null;
    }
  };

  // If loading, show loading spinner
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">{error}</Typography>
          <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 2 }}>
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // If no user profile, redirect to login
  if (!userProfile) {
    navigate('/login');
    return null;
  }
  
  // Get full name
  const fullName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
  
  // Handle sending a message in the chat
  const handleSendMessage = async () => {
    if (userInput.trim() === '') return;
    
    // Store the current input before clearing it
    const currentInput = userInput;
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { sender: 'user', text: currentInput }]);
    
    // Clear input field immediately for better UX
    setUserInput('');
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Get response from Gemini AI
      const response = await getDellAssistantResponse(
        currentInput, 
        chatMessages, // Pass all messages for context
        userProfile // Pass user profile for personalization
      );
      
      // Add a slight delay to simulate natural typing
      setTimeout(() => {
        // Add the response to chat
        setChatMessages(prev => [...prev, { sender: 'bot', text: response }]);
        // Hide typing indicator
        setIsTyping(false);
      }, 500 + Math.random() * 1000); // Random delay between 500-1500ms for natural feel
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add a slight delay before showing the error message
      setTimeout(() => {
        // Add error message to chat
        setChatMessages(prev => [...prev, { 
          sender: 'bot', 
          text: "I'm experiencing some technical difficulties. Please try again or contact the IT helpdesk if you need immediate assistance.",
          isError: true
        }]);
        // Hide typing indicator
        setIsTyping(false);
      }, 500);
    }
  };
  
  // Format message text with line breaks
  const formatMessageText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  // Handle key press in chat input (send on Enter)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 6, backgroundColor: '#f5f8fa' }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Welcome Banner */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(45deg, #0076CE 30%, #0092E0 90%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
            <BusinessIcon sx={{ fontSize: 180 }} />
          </Box>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome to Dell Technologies, {fullName}!
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
                You're on day {calculateDaysSinceStart()} of your onboarding journey. Keep up the great progress!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Onboarding Status: <strong>{userProfile.onboardingStatus || 'In Progress'}</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={userProfile.role || 'Employee'} 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 500 
                  }} 
                />
                <Chip 
                  label={userProfile.department || 'Dell Technologies'} 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 500 
                  }} 
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  63%
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  Overall Onboarding Progress
                </Typography>
                <Box sx={{ width: '100%', maxWidth: 200, ml: { xs: 0, md: 'auto' } }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={63} /* Fixed at 63% (5/8) to match the profile page */
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white'
                      }
                    }} 
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Main Content */}
        <Grid container spacing={3}>
          
          <Grid item xs={12} md={8}>
            {/* Current Task Card */}
            <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ 
                bgcolor: 'primary.main', 
                py: 1.5, 
                px: 3, 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AccessTimeIcon fontSize="small" />
                <Typography variant="subtitle1" fontWeight={600}>Current Task</Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>{currentTask}</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  This task is part of your required onboarding process. Complete it to continue your progress.
                </Typography>
                <Button 
                  variant="contained" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/training')}
                  sx={{ mt: 1 }}
                >
                  Continue Task
                </Button>
              </CardContent>
            </Card>

            {/* Learning Modules Section */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight="bold">Your Learning Path</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/training')}
              >
                View All
              </Button>
            </Box>
            
            <Stack spacing={3}>
              {modules.map((module) => (
                <Card 
                  key={module.id} 
                  sx={{ 
                    borderRadius: 3,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={7}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: module.status === 'completed' ? 'success.main' : 
                                    module.status === 'in-progress' ? 'primary.main' : 'grey.300',
                              width: 48,
                              height: 48
                            }}
                          >
                            {module.icon}
                          </Avatar>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="h6">{module.title}</Typography>
                              <Chip 
                                icon={getStatusIcon(module.status)}
                                label={module.status === 'completed' ? 'Completed' : 
                                      module.status === 'in-progress' ? 'In Progress' : 'Not Started'} 
                                color={getStatusColor(module.status)}
                                size="small"
                                sx={{ ml: 1, height: 24 }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                              {module.description}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Progress
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" color="text.primary">
                              {module.progress}/{module.total} units
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(module.progress / module.total) * 100} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              mb: 2
                            }} 
                          />
                          <Button 
                            variant={module.status === 'completed' ? 'outlined' : 'contained'}
                            size="small"
                            onClick={() => navigate('/training')}
                            fullWidth
                          >
                            {module.status === 'completed' ? 'Review Again' : 'Continue'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4}>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Days at Dell Card */}
              <Grid item xs={12} sm={6} md={12}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 3, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  pb: 4
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 118, 206, 0.1)',
                    borderRadius: '50%',
                    width: 70,
                    height: 70,
                    mb: 2
                  }}>
                    <AccessTimeIcon sx={{ fontSize: 35, color: '#0076CE' }} />
                  </Box>
                  <Typography variant="h3" fontWeight="bold" align="center" gutterBottom>
                    {calculateDaysSinceStart()}
                  </Typography>
                  <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 0 }}>
                    Days at
                  </Typography>
                  <Typography variant="h6" align="center" color="text.secondary">
                    Dell
                  </Typography>
                </Card>
              </Grid>
              
              {/* Modules Completed Card */}
              <Grid item xs={12} sm={6} md={12}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 3, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  p: 3,
                  pb: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    borderRadius: '50%',
                    width: 70,
                    height: 70,
                    mb: 2
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 35, color: '#1976d2' }} />
                  </Box>
                  <Typography variant="h3" fontWeight="bold" align="center" gutterBottom>
                    {modules.filter(m => m.status === 'completed').length}
                  </Typography>
                  <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 0 }}>
                    Modules
                  </Typography>
                  <Typography variant="h6" align="center" color="text.secondary">
                    Completed
                  </Typography>
                </Card>
              </Grid>
            </Grid>
            
            {/* Profile Card */}
            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      bgcolor: 'primary.main',
                      fontSize: 24,
                      fontWeight: 'bold'
                    }}
                  >
                    {userProfile.firstName?.charAt(0) || ''}{userProfile.lastName?.charAt(0) || ''}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6">{fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">{userProfile.role || 'Employee'}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Department</Typography>
                    <Typography variant="body1">{userProfile.department || 'Dell Technologies'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Start Date</Typography>
                    <Typography variant="body1">{userProfile.startDate ? new Date(userProfile.startDate).toLocaleDateString() : 'January 15, 2025'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Onboarding Status</Typography>
                    <Chip 
                      icon={<TrendingUpIcon />} 
                      label={userProfile.onboardingStatus || 'In Progress'} 
                      color="primary" 
                      size="medium" 
                    />
                  </Box>
                </Stack>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth 
                  sx={{ mt: 3 }}
                  onClick={() => navigate('/profile')}
                >
                  View Full Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links Card */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Quick Links</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<BusinessIcon />} 
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                    onClick={() => window.open('https://www.dell.com/en-us/dt/corporate/about-us/who-we-are.htm', '_blank')}
                  >
                    Company Resources
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<PolicyIcon />} 
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                    onClick={() => window.open('https://www.dell.com/en-my/lp/dt/security-and-resiliency', '_blank')}
                  >
                    Security Policies
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<SchoolIcon />} 
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                    onClick={() => navigate('/study-companion')}
                  >
                    Learning Portal
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<FlagIcon />} 
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                    onClick={() => navigate('/support')}
                  >
                    Help & Support
                  </Button>
                </Stack>
              </CardContent>
            </Card>


          </Grid>
        </Grid>
      </Container>
      
      {/* Floating Chatbot Widget */}
      <Draggable nodeRef={nodeRef} bounds="parent" handle=".drag-handle">
        <Box
          ref={nodeRef}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            transition: 'all 0.3s ease',
            width: isChatOpen ? 350 : 60,
            height: isChatOpen ? 500 : 60,
            borderRadius: isChatOpen ? 10 : '50%',
            bgcolor: 'primary.main',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transform: 'scale(1)',
            '&:hover': {
              transform: isChatOpen ? 'scale(1)' : 'scale(1.05)',
              boxShadow: isChatOpen ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 32px rgba(0,0,0,0.3)'
            }
          }}
        >
          {/* Chat Header - Draggable Area */}
          <Box 
            className="drag-handle"
            sx={{
              bgcolor: 'primary.dark',
              color: 'white',
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'move',
              borderTopLeftRadius: isChatOpen ? 8 : 30,
              borderTopRightRadius: isChatOpen ? 8 : 30,
              borderBottomLeftRadius: !isChatOpen ? 30 : 0,
              borderBottomRightRadius: !isChatOpen ? 30 : 0,
              transition: 'all 0.3s ease'
            }}
          >
            {isChatOpen ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.light', 
                      width: 32, 
                      height: 32,
                      boxShadow: '0 0 0 2px rgba(255,255,255,0.2)'
                    }}
                  >
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Dell Assistant
                  </Typography>
                </Box>
                <Box>
                  <IconButton 
                    size="small" 
                    onClick={() => setIsChatOpen(false)}
                    sx={{ color: 'white' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <SmartToyIcon onClick={() => setIsChatOpen(true)} sx={{ cursor: 'pointer' }} />
              </Box>
            )}
          </Box>
          
          {/* Chat Content - Only visible when expanded */}
          {isChatOpen && (
            <>
              {/* Messages Container */}
              <Box sx={{
                flexGrow: 1,
                p: 2,
                overflowY: 'auto',
                bgcolor: '#f5f8fa',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
              }}>
                {chatMessages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
                      color: msg.sender === 'user' ? 'white' : 'text.primary',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      position: 'relative',
                      '&::before': msg.sender === 'bot' ? {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        top: 10,
                        borderWidth: 8,
                        borderStyle: 'solid',
                        borderColor: 'transparent white transparent transparent',
                      } : msg.sender === 'user' ? {
                        content: '""',
                        position: 'absolute',
                        right: -8,
                        top: 10,
                        borderWidth: 8,
                        borderStyle: 'solid',
                        borderColor: 'transparent transparent transparent primary.main',
                      } : {}
                    }}
                  >
                    {msg.sender === 'bot' && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          fontWeight: 'bold',
                          mb: 0.5,
                          color: 'primary.main'
                        }}
                      >
                        Dell Assistant
                      </Typography>
                    )}
                    <Typography variant="body2">
                      {formatMessageText(msg.text)}
                    </Typography>
                  </Box>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <Box
                    sx={{
                      alignSelf: 'flex-start',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      Dell Assistant
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 6, height: 6, bgcolor: 'primary.main', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                      <Box sx={{ width: 6, height: 6, bgcolor: 'primary.main', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                      <Box sx={{ width: 6, height: 6, bgcolor: 'primary.main', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
                    </Box>
                  </Box>
                )}
                
                {/* Invisible element to scroll to */}
                <div ref={chatEndRef} />
              </Box>
              
              {/* Input Area */}
              <Box sx={{
                p: 2,
                bgcolor: 'white',
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                {/* Suggestion chips */}
                {chatMessages.length < 3 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {[
                      "How do I access my training?",
                      "What benefits do I have?",
                      "Who is my manager?",
                      "IT support contact?"
                    ].map((suggestion, index) => (
                      <Chip
                        key={index}
                        label={suggestion}
                        size="small"
                        onClick={() => {
                          setUserInput(suggestion);
                          setTimeout(() => handleSendMessage(), 100);
                        }}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'primary.light', color: 'white' }
                        }}
                      />
                    ))}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your question..."
                    variant="outlined"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isTyping}
                    sx={{ 
                      '& fieldset': { borderRadius: 4 },
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: 2
                        }
                      }
                    }}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isTyping}
                    sx={{
                      bgcolor: userInput.trim() && !isTyping ? 'primary.main' : 'grey.200',
                      color: userInput.trim() && !isTyping ? 'white' : 'grey.500',
                      '&:hover': {
                        bgcolor: userInput.trim() && !isTyping ? 'primary.dark' : 'grey.200',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Draggable>
    </Box>
  );
};

export default Dashboard;
