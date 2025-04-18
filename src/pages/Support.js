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
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ChatIcon from '@mui/icons-material/Chat';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FaqModal from '../components/FaqModal';
import LiveChatModal from '../components/LiveChatModal';
import DocumentUploadModal from '../components/DocumentUploadModal';

const Support = () => {
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [isLiveChatModalOpen, setIsLiveChatModalOpen] = useState(false);
  const [isDocUploadModalOpen, setIsDocUploadModalOpen] = useState(false);
  
  const handleOpenFaqModal = () => {
    setIsFaqModalOpen(true);
  };
  
  const handleCloseFaqModal = () => {
    setIsFaqModalOpen(false);
  };
  
  const handleOpenLiveChatModal = () => {
    setIsLiveChatModalOpen(true);
  };
  
  const handleCloseLiveChatModal = () => {
    setIsLiveChatModalOpen(false);
  };
  
  const handleOpenDocUploadModal = () => {
    setIsDocUploadModalOpen(true);
  };
  
  const handleCloseDocUploadModal = () => {
    setIsDocUploadModalOpen(false);
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
          Help & Support
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find answers to your questions and get the support you need during your onboarding journey.
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
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <QuestionAnswerIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">FAQ</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              Common onboarding queries answered by AI. Our FAQ assistant references Dell's official documentation to provide accurate information.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<QuestionAnswerIcon />}
              onClick={handleOpenFaqModal}
              sx={{ mt: 1 }}
            >
              Ask AI
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
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                <ChatIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">Live Chat</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              Connect with HR representatives or the AI Assistant for real-time support and guidance during your onboarding process.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<ChatIcon />}
              onClick={handleOpenLiveChatModal}
              sx={{ mt: 1 }}
            >
              Start Chat
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
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CloudUploadIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">Document Upload</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              Submit files for certifications, training completion, or HR use. Securely upload your documents for processing.
            </Typography>
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<CloudUploadIcon />}
              onClick={handleOpenDocUploadModal}
              sx={{ mt: 1 }}
            >
              Upload Document
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
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <MenuBookIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">Knowledge Base</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              Access Dell's comprehensive knowledge base for detailed information about products, services, and company policies.
            </Typography>
            <Button 
              onClick={() => window.open('https://www.dell.com/support/kbdoc/en-my/000150788/ask-dell-knowledge-base', '_blank')}
              variant="contained" 
              color="info" 
              startIcon={<MenuBookIcon />}
              sx={{ mt: 1 }}
            >
              Go to Knowledge Base
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* FAQ Modal */}
      <FaqModal open={isFaqModalOpen} onClose={handleCloseFaqModal} />
      
      {/* Live Chat Modal */}
      <LiveChatModal open={isLiveChatModalOpen} onClose={handleCloseLiveChatModal} />
      
      {/* Document Upload Modal */}
      <DocumentUploadModal open={isDocUploadModalOpen} onClose={handleCloseDocUploadModal} />
    </Container>
  );
};

export default Support;
