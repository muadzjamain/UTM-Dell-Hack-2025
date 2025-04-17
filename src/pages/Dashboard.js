import React, { useState } from 'react';
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
  Stack
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BusinessIcon from '@mui/icons-material/Business';
import PolicyIcon from '@mui/icons-material/Policy';
import FlagIcon from '@mui/icons-material/Flag';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Placeholder data, replace with real user/task data from Firebase
  const [employee] = useState({ 
    name: 'John Doe', 
    role: 'Software Developer', 
    department: 'Engineering', 
    progress: 60,
    startDate: '2025-04-10',
    avatar: null // In a real app, this would be the user's profile image URL
  });
  
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
    const startDate = new Date(employee.startDate);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
                Welcome to Dell Technologies, {employee.name}!
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
                You're on day {calculateDaysSinceStart()} of your onboarding journey. Keep up the great progress!
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={employee.role} 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 500 
                  }} 
                />
                <Chip 
                  label={employee.department} 
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
                  {employee.progress}%
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  Overall Onboarding Progress
                </Typography>
                <Box sx={{ width: '100%', maxWidth: 200, ml: { xs: 0, md: 'auto' } }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={employee.progress} 
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
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                        {calculateDaysSinceStart()}
                      </Typography>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36 }}>
                        <AccessTimeIcon fontSize="small" />
                      </Avatar>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Days at Dell
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {modules.filter(m => m.status === 'completed').length}
                      </Typography>
                      <Avatar sx={{ bgcolor: 'success.light', width: 36, height: 36 }}>
                        <CheckCircleIcon fontSize="small" />
                      </Avatar>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Modules Completed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Profile Card */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={employee.avatar} 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      bgcolor: 'primary.main',
                      fontSize: '1.5rem',
                      mr: 2 
                    }}
                  >
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{employee.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{employee.role}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Department</Typography>
                    <Typography variant="body1" fontWeight={500}>{employee.department}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Start Date</Typography>
                    <Typography variant="body1" fontWeight={500}>{new Date(employee.startDate).toLocaleDateString()}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Onboarding Status</Typography>
                    <Chip 
                      icon={<TrendingUpIcon />}
                      label="In Progress" 
                      color="primary" 
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </Stack>
                
                <Button 
                  fullWidth 
                  variant="outlined" 
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
                    onClick={() => navigate('/training')}
                  >
                    Security Policies
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<SchoolIcon />} 
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                    onClick={() => navigate('/training')}
                  >
                    Learning Portal
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<FlagIcon />} 
                    sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                    onClick={() => window.open('https://www.dell.com/support/home/en-us', '_blank')}
                  >
                    Help & Support
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* AI Assistant Card */}
            <Card sx={{ borderRadius: 3, bgcolor: 'primary.main', color: 'white' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>AI Onboarding Assistant</Typography>
                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                <Typography variant="body2" paragraph sx={{ opacity: 0.9 }}>
                  Have questions about your onboarding? Our AI assistant can help you find information, answer questions, and guide you through the process.
                </Typography>
                <Button 
                  fullWidth 
                  variant="contained" 
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)'
                    }
                  }}
                  onClick={() => navigate('/assistant')}
                >
                  Ask Assistant
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
