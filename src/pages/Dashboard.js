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
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


const Dashboard = () => {
  const navigate = useNavigate();

  
  // State for user profile data
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for training plans and goals
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [personalizedGoals, setPersonalizedGoals] = useState([]);
  

  
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
            startDate: new Date().toISOString().split('T')[0]
          };
          
          setUserProfile(fallbackProfile);
        }
        
        // Load training plans from localStorage
        const savedPlans = localStorage.getItem('training_studyPlanHistory');
        if (savedPlans) {
          // Sort plans by timestamp (newest first)
          const plans = JSON.parse(savedPlans);
          plans.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setTrainingPlans(plans);
        }
        
        // Load personalized goals
        const savedGoals = localStorage.getItem('personalized_goals');
        if (savedGoals) {
          setPersonalizedGoals(JSON.parse(savedGoals));
        } else {
          // Mock goals data
          setPersonalizedGoals([
            { 
              id: 1, 
              title: 'Complete Security Training', 
              description: 'Finish all security modules by end of month',
              progress: 60,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              category: 'Training'
            },
            { 
              id: 2, 
              title: 'Technical Certification', 
              description: 'Achieve Dell Technical Associate certification',
              progress: 25,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              category: 'Professional Development'
            },
            { 
              id: 3, 
              title: 'Team Project Contribution', 
              description: 'Complete assigned tasks for Q2 project',
              progress: 40,
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              category: 'Projects'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const currentTask = 'Complete HR Training';
  
  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'in-progress':
        return <AccessTimeIcon fontSize="small" />;
      default:
        return null;
    }
  };
  
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      default:
        return 'default';
    }
  };
  
  // Calculate days since start
  const calculateDaysSinceStart = () => {
    if (!userProfile || !userProfile.startDate) return 1;
    
    const startDate = new Date(userProfile.startDate);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays || 1;
  };
  
  // Get user's full name
  const fullName = userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : 'User';
  

  


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
  
  return (
    <Box sx={{ minHeight: '100vh', pb: 6, backgroundColor: '#f5f8fa' }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Welcome Banner */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 4, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, #0076CE, #1565C0)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(0, 118, 206, 0.15)'
          }}
        >
          <Box sx={{ 
            position: 'absolute', 
            right: -40, 
            top: -40, 
            opacity: 0.07,
            transform: 'rotate(10deg)'
          }}>
            <BusinessIcon sx={{ fontSize: 220 }} />
          </Box>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ 
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Welcome, {fullName}!
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  opacity: 0.95, 
                  mb: 2,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  fontWeight: 500
                }}>
                  You're on day {calculateDaysSinceStart()} of your onboarding journey. Keep up the great progress!
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 1.5, 
                mb: 2, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Onboarding Status: <span style={{ fontWeight: 700 }}>{userProfile.onboardingStatus || 'In Progress'}</span>
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<BusinessIcon fontSize="small" />} 
                  label={userProfile.department || 'Dell Technologies'} 
                  size="medium" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    color: 'white',
                    fontWeight: 500,
                    '& .MuiChip-icon': { color: 'white' },
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                  }} 
                />
                <Chip 
                  icon={<FlagIcon fontSize="small" />} 
                  label={userProfile.role || 'Employee'} 
                  size="medium" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    color: 'white',
                    fontWeight: 500,
                    '& .MuiChip-icon': { color: 'white' },
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                  }} 
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: { xs: 'flex-start', md: 'flex-end' },
                p: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 3,
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
                  63%
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5, opacity: 0.9, fontWeight: 500 }}>
                  Overall Onboarding Progress
                </Typography>
                <Box sx={{ width: '100%' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={63} /* Fixed at 63% (5/8) to match the profile page */
                    sx={{ 
                      height: 10, 
                      borderRadius: 5, 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                        boxShadow: '0 0 10px rgba(255,255,255,0.5)'
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
                  onClick={() => navigate('/study-companion')}
                  sx={{ mt: 1 }}
                >
                  Continue Task
                </Button>
              </CardContent>
            </Card>

            {/* Training Plans Section */}
            <Box sx={{ 
              mb: 3, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pb: 1,
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }} />
                <Typography variant="h5" fontWeight="bold">Your Training Plans</Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/study-companion')}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(21, 101, 192, 0.04)'
                  }
                }}
              >
                View All
              </Button>
            </Box>
            
            <Stack spacing={2.5}>
              {trainingPlans.length > 0 ? (
                // Display only the 3 latest training plans
                trainingPlans.slice(0, 3).map((plan, index) => (
                  <Card 
                    key={index} 
                    sx={{ 
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={7}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: (plan.progress || 0) === 100 ? 'success.main' : 
                                       (plan.progress || 0) > 0 ? 'primary.main' : 'grey.300',
                                width: 52,
                                height: 52,
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              {(plan.progress || 0) === 100 ? <CheckCircleIcon /> : <SchoolIcon />}
                            </Avatar>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1565C0' }}>
                                  {plan.title || `Training Plan ${index + 1}`}
                                </Typography>
                                <Chip 
                                  icon={(plan.progress || 0) === 100 ? <CheckCircleIcon /> : <AccessTimeIcon />}
                                  label={(plan.progress || 0) === 100 ? 'Completed' : 
                                        (plan.progress || 0) > 0 ? 'In Progress' : 'Not Started'} 
                                  color={(plan.progress || 0) === 100 ? 'success' : 
                                        (plan.progress || 0) > 0 ? 'primary' : 'default'}
                                  size="small"
                                  sx={{ 
                                    height: 26, 
                                    fontWeight: 500,
                                    '& .MuiChip-icon': { fontSize: 16 }
                                  }}
                                />
                              </Box>
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                paragraph 
                                sx={{ 
                                  mb: 1.5,
                                  lineHeight: 1.5,
                                  fontSize: '0.9rem'
                                }}
                              >
                                {plan.overview ? plan.overview.substring(0, 120) + '...' : 'No overview available'}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AccessTimeIcon sx={{ fontSize: 16, color: '#1565C0', mr: 0.5 }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {new Date(plan.timestamp).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <SchoolIcon sx={{ fontSize: 16, color: '#1565C0', mr: 0.5 }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {plan.days?.length || 7} days
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: '100%', 
                            justifyContent: 'center',
                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 2,
                            p: 2
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Progress
                              </Typography>
                              <Typography variant="body2" fontWeight="600" color="text.primary">
                                {plan.progress || 0}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={plan.progress || 0} 
                              sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                mb: 2.5,
                                bgcolor: 'rgba(21, 101, 192, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: (plan.progress || 0) === 100 ? 'success.main' : '#1565C0',
                                  boxShadow: '0 0 8px rgba(21, 101, 192, 0.4)'
                                }
                              }} 
                            />
                            <Button 
                              variant="contained"
                              size="medium"
                              onClick={() => navigate('/study-companion')}
                              fullWidth
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: '0 4px 8px rgba(21, 101, 192, 0.2)',
                                '&:hover': {
                                  boxShadow: '0 6px 12px rgba(21, 101, 192, 0.3)'
                                }
                              }}
                              startIcon={<SchoolIcon />}
                            >
                              Continue Training
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card sx={{ 
                  borderRadius: 3, 
                  p: 4, 
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  <Box sx={{ py: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      borderRadius: '50%',
                      width: 80,
                      height: 80,
                      mb: 3,
                      mx: 'auto'
                    }}>
                      <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">No Training Plans Yet</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                      Create your first personalized training plan to track your progress and enhance your skills
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate('/study-companion')}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 8px rgba(21, 101, 192, 0.2)',
                        '&:hover': {
                          boxShadow: '0 6px 12px rgba(21, 101, 192, 0.3)'
                        }
                      }}
                      startIcon={<SchoolIcon />}
                    >
                      Create Training Plan
                    </Button>
                  </Box>
                </Card>
              )}
            </Stack>
            
            {/* Add more space before Personalized Goals */}
            <Box sx={{ mt: 6 }}></Box>
            
            {/* Personalized Goals Section */}
            <Box sx={{ 
              mb: 3, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pb: 1,
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              pt: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FlagIcon sx={{ color: 'primary.main', mr: 1.5, fontSize: 28 }} />
                <Typography variant="h5" fontWeight="bold">Your Personalized Goals</Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/goals')}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(21, 101, 192, 0.04)'
                  }
                }}
              >
                View All
              </Button>
            </Box>
            
            <Stack spacing={2.5}>
              {personalizedGoals.length > 0 ? (
                // Display only the 3 latest personalized goals
                personalizedGoals.slice(0, 3).map((goal) => (
                  <Card 
                    key={goal.id} 
                    sx={{ 
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={7}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: goal.progress === 100 ? 'success.main' : 
                                      goal.progress > 50 ? 'primary.main' : 
                                      goal.progress > 0 ? 'warning.main' : 'grey.300',
                                width: 52,
                                height: 52,
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              {goal.progress === 100 ? <CheckCircleIcon /> : <FlagIcon />}
                            </Avatar>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1565C0' }}>
                                  {goal.title}
                                </Typography>
                                <Chip 
                                  label={goal.category} 
                                  size="small"
                                  sx={{ 
                                    height: 26, 
                                    fontWeight: 500,
                                    bgcolor: 'rgba(21, 101, 192, 0.08)',
                                    color: 'primary.main'
                                  }}
                                />
                              </Box>
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                paragraph 
                                sx={{ 
                                  mb: 1.5,
                                  lineHeight: 1.5,
                                  fontSize: '0.9rem'
                                }}
                              >
                                {goal.description}
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                bgcolor: 'rgba(0, 0, 0, 0.03)',
                                borderRadius: 2,
                                py: 0.5,
                                px: 1.5,
                                width: 'fit-content'
                              }}>
                                <AccessTimeIcon sx={{ fontSize: 16, color: '#1565C0', mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  Due: {new Date(goal.dueDate).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: '100%', 
                            justifyContent: 'center',
                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 2,
                            p: 2
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Progress
                              </Typography>
                              <Typography variant="body2" fontWeight="600" color="text.primary">
                                {goal.progress}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={goal.progress} 
                              sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                mb: 2.5,
                                bgcolor: 'rgba(21, 101, 192, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: goal.progress === 100 ? 'success.main' : 
                                          goal.progress > 50 ? 'primary.main' : 
                                          'warning.main',
                                  boxShadow: '0 0 8px rgba(21, 101, 192, 0.4)'
                                }
                              }} 
                            />
                            <Button 
                              variant="contained"
                              size="medium"
                              onClick={() => navigate('/goals')}
                              fullWidth
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: '0 4px 8px rgba(21, 101, 192, 0.2)',
                                '&:hover': {
                                  boxShadow: '0 6px 12px rgba(21, 101, 192, 0.3)'
                                }
                              }}
                              startIcon={<FlagIcon />}
                            >
                              Update Progress
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card sx={{ 
                  borderRadius: 3, 
                  p: 4, 
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  <Box sx={{ py: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      borderRadius: '50%',
                      width: 80,
                      height: 80,
                      mb: 3,
                      mx: 'auto'
                    }}>
                      <FlagIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">No Personalized Goals Yet</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                      Create your first personalized goal to track your progress and achieve your career objectives
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate('/goals')}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 8px rgba(21, 101, 192, 0.2)',
                        '&:hover': {
                          boxShadow: '0 6px 12px rgba(21, 101, 192, 0.3)'
                        }
                      }}
                      startIcon={<FlagIcon />}
                    >
                      Create Goal
                    </Button>
                  </Box>
                </Card>
              )}
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4}>
            {/* Stats Cards - Side by Side */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {/* Days at Dell Card */}
              <Grid item xs={6}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 3, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 118, 206, 0.1)',
                    borderRadius: '50%',
                    width: 50,
                    height: 50,
                    mb: 1
                  }}>
                    <AccessTimeIcon fontSize="25" sx={{ color: '#0076CE' }} />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
                    {calculateDaysSinceStart()}
                  </Typography>
                  <Typography variant="subtitle1" align="center" color="text.secondary">
                    Days at Dell
                  </Typography>
                </Card>
              </Grid>
              
              {/* Modules Completed Card */}
              <Grid item xs={6}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 3, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  p: 2,
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
                    width: 50,
                    height: 50,
                    mb: 1
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 25, color: '#1976d2' }} />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
                    {trainingPlans.filter(plan => plan.status === 'completed').length}
                  </Typography>
                  <Typography variant="subtitle1" align="center" color="text.secondary">
                    Modules Completed
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
    </Box>
  );
};

export default Dashboard;
