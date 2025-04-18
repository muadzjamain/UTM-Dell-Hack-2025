import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper,
  Avatar,
  Grid,
  Divider
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import QuizIcon from '@mui/icons-material/Quiz';
import CultureModal from '../components/CultureModal';
import ComplianceQuizModal from '../components/ComplianceQuizModal';

const CultureCompliance = () => {
  const [isCultureModalOpen, setIsCultureModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  
  const handleOpenCultureModal = () => {
    setIsCultureModalOpen(true);
  };
  
  const handleCloseCultureModal = () => {
    setIsCultureModalOpen(false);
  };
  
  const handleOpenQuizModal = () => {
    setIsQuizModalOpen(true);
  };
  
  const handleCloseQuizModal = () => {
    setIsQuizModalOpen(false);
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="secondary.main">
          Company Culture & Compliance
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Learn about our values, ethics, and compliance requirements.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                <BusinessIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">AI Conversations</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              Engage in guided Q&A sessions to understand Dell's culture, values, and ethics. Our AI assistant will help you navigate Dell's workplace expectations.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<BusinessIcon />}
              onClick={handleOpenCultureModal}
              sx={{ mt: 1 }}
            >
              Start Q&A
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <QuizIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">Compliance Quiz</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              Test your knowledge of Dell's compliance requirements with AI-generated assessments. These quizzes help reinforce key compliance concepts.
            </Typography>
            <Button 
              variant="contained" 
              color="warning" 
              startIcon={<QuizIcon />}
              onClick={handleOpenQuizModal}
              sx={{ mt: 1 }}
            >
              Start Quiz
            </Button>
          </Paper>
        </Grid>
      </Grid>
      

      
      {/* Culture & Compliance Modal */}
      <CultureModal open={isCultureModalOpen} onClose={handleCloseCultureModal} />
      
      {/* Compliance Quiz Modal */}
      <ComplianceQuizModal open={isQuizModalOpen} onClose={handleCloseQuizModal} />
    </Container>
  );
};

export default CultureCompliance;
