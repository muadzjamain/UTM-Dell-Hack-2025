import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';

const LandingPage = () => {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Container maxWidth="md" sx={{ flexGrow: 1, py: 8, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Seamless Onboarding for New Hires with Generative AI
        </Typography>
        <Typography variant="h5" gutterBottom>
          Welcome to your first day, [Employee Name]!
        </Typography>
        <Button variant="contained" color="primary" size="large" href="/login">
          Start Your Onboarding Journey
        </Button>
      </Container>
      <Box component="footer" py={3} bgcolor="#f5f5f5" textAlign="center">
        <Typography variant="body2">
          HR Resources | Company Culture | <a href="mailto:hr@company.com">Contact</a>
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
