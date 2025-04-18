import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  Fade,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import { auth } from '../firebase';

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate content loading with a slight delay for animation
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const handleStartOnboarding = () => {
    navigate('/dashboard');
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4ecfb 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative elements */}
      <Box 
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,118,206,0.1) 0%, rgba(0,118,206,0) 70%)',
          zIndex: 0
        }}
      />
      <Box 
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,118,206,0.08) 0%, rgba(0,118,206,0) 60%)',
          zIndex: 0
        }}
      />
      
      {/* Header with Dell logo */}
      <Box 
        component="header" 
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            color: '#0076CE',
            letterSpacing: '-0.5px'
          }}
        >
          Deltri
        </Typography>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => navigate('/login')}
          sx={{
            borderRadius: 8,
            px: 3,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Sign In
        </Button>
      </Box>

      {/* Main content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          py: { xs: 4, md: 8 },
          position: 'relative',
          zIndex: 1
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Fade in={loaded} timeout={1000}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
                <Typography 
                  variant={isSmall ? "h3" : isMobile ? "h2" : "h1"} 
                  component="h1"
                  sx={{ 
                    fontWeight: 800,
                    mb: 2,
                    color: '#202124',
                    lineHeight: 1.2
                  }}
                >
                  Seamless Onboarding for New Hires with Generative AI
                </Typography>
                
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ 
                    mb: 4,
                    maxWidth: { md: '90%' },
                    fontWeight: 400,
                    lineHeight: 1.5
                  }}
                >
                  Welcome to Dell Technologies! We've created a personalized onboarding experience to help you succeed from day one.
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleStartOnboarding}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 8,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #0076CE 30%, #0092E0 90%)',
                    boxShadow: '0 8px 16px rgba(0, 118, 206, 0.3)',
                    textTransform: 'none',
                    '&:hover': {
                      boxShadow: '0 10px 20px rgba(0, 118, 206, 0.4)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Start Your Onboarding Journey
                </Button>
              </Box>
            </Fade>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Fade in={loaded} timeout={1200}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 300, md: 400 },
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    width: '80%',
                    height: '80%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    background: '#fff'
                  }}
                >
                  <Box
                    component="img"
                    src="Deltri/src/images/Boarding page image.png"
                    alt="Dell Onboarding"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      opacity: 0.9
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.style.display = 'flex';
                      e.target.style.alignItems = 'center';
                      e.target.style.justifyContent = 'center';
                      e.target.style.backgroundColor = '#f0f4f8';
                      e.target.style.color = '#0076CE';
                      e.target.innerHTML = '<div style="text-align: center; padding: 20px;"><svg width="80" height="80" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72L5.18 9L12 5.28L18.82 9zM17 15.99l-5 2.73l-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg><p style="margin-top: 10px; font-weight: bold;">Dell Technologies</p></div>';
                    }}
                  />
                </Paper>
                
                {/* Floating elements */}
                <Avatar
                  sx={{
                    position: 'absolute',
                    top: '15%',
                    left: '10%',
                    bgcolor: 'primary.main',
                    width: 56,
                    height: 56,
                    boxShadow: '0 4px 12px rgba(0, 118, 206, 0.3)'
                  }}
                >
                  <SchoolIcon fontSize="large" />
                </Avatar>
                
                <Avatar
                  sx={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '15%',
                    bgcolor: 'success.main',
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(0, 125, 184, 0.3)'
                  }}
                >
                  <BusinessCenterIcon />
                </Avatar>
                
                <Avatar
                  sx={{
                    position: 'absolute',
                    top: '30%',
                    right: '12%',
                    bgcolor: 'warning.main',
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(255, 157, 0, 0.3)'
                  }}
                >
                  <GroupsIcon />
                </Avatar>
                
                <Avatar
                  sx={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '18%',
                    bgcolor: 'info.main',
                    width: 40,
                    height: 40,
                    boxShadow: '0 4px 12px rgba(0, 118, 206, 0.3)'
                  }}
                >
                  <SecurityIcon />
                </Avatar>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{
          py: 4,
          px: 3,
          mt: 'auto',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="space-between" alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Dell Technologies. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack 
                direction="row" 
                spacing={3} 
                divider={<Divider orientation="vertical" flexItem />}
                justifyContent={{ xs: 'center', md: 'flex-end' }}
              >
                <Typography variant="body2" component="a" href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  HR Resources
                </Typography>
                <Typography variant="body2" component="a" href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Company Culture
                </Typography>
                <Typography variant="body2" component="a" href="mailto:hr@dell.com" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Contact
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
