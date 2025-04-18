import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography, 
  TextField, 
  Button, 
  Box, 
  IconButton,
  Chip,
  Avatar,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import BusinessIcon from '@mui/icons-material/Business';
import { getCultureResponse, getCommonCultureQuestions } from '../services/cultureService';

/**
 * Culture & Compliance Modal component that provides an AI-powered conversation interface
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Function to call when closing the modal
 */
const CultureModal = ({ open, onClose }) => {
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      id: 'welcome', 
      sender: 'bot', 
      text: "Hello! I'm Dell's Culture & Compliance Assistant. I can help you understand Dell's values, ethics, and compliance requirements. What would you like to know about working at Dell?" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const commonQuestions = getCommonCultureQuestions();

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (userQuery.trim() === '') return;
    
    // Store the current query before clearing it
    const currentQuery = userQuery;
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: currentQuery 
    }]);
    
    // Clear input field immediately for better UX
    setUserQuery('');
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Get response from Gemini AI
      const response = await getCultureResponse(currentQuery);
      
      // Add a slight delay to simulate natural typing
      setTimeout(() => {
        // Add the response to chat
        setChatHistory(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: response 
        }]);
        // Hide typing indicator
        setIsTyping(false);
      }, 800 + Math.random() * 1200); // Random delay between 800-2000ms for natural feel
      
    } catch (error) {
      console.error('Error getting Culture & Compliance response:', error);
      
      // Add error message to chat after a slight delay
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: "I'm sorry, I couldn't provide information about Dell's culture and compliance at the moment. Please try again or reach out to your HR representative for assistance.",
          isError: true
        }]);
        setIsTyping(false);
      }, 800);
    }
  };

  // Handle key press in chat input (send on Enter)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (userQuery.trim()) {
        handleSendMessage();
      }
    }
  };

  // Format message text with line breaks
  const formatMessageText = (text) => {
    if (!text) return '';
    return text.split('\\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Handle clicking on a suggestion chip
  const handleSuggestionClick = (suggestion) => {
    setUserQuery(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="modal-enter"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          height: '80vh'
        }
      }}
    >
      {/* Header */}
      <DialogTitle 
        sx={{ 
          bgcolor: 'secondary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'secondary.light' }}>
            <BusinessIcon />
          </Avatar>
          <Typography variant="h6">Dell Culture & Compliance Assistant</Typography>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose} 
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent 
        sx={{ 
          p: 0, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%'
        }}
      >
        {/* Chat Messages */}
        <Box 
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: 'auto',
            bgcolor: '#f5f8fa',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {chatHistory.map((msg) => (
            <Box
              key={msg.id}
              className={msg.sender === 'user' ? 'user-message' : 'bot-message'}
              sx={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                minWidth: '30%'
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: msg.sender === 'user' ? 'secondary.main' : 'white',
                  color: msg.sender === 'user' ? 'white' : 'text.primary',
                  position: 'relative',
                  '&::before': msg.sender === 'bot' ? {
                    content: '""',
                    position: 'absolute',
                    left: -10,
                    top: 15,
                    borderWidth: '10px 10px 10px 0',
                    borderStyle: 'solid',
                    borderColor: 'transparent white transparent transparent',
                  } : msg.sender === 'user' ? {
                    content: '""',
                    position: 'absolute',
                    right: -10,
                    top: 15,
                    borderWidth: '10px 0 10px 10px',
                    borderStyle: 'solid',
                    borderColor: 'transparent transparent transparent secondary.main',
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
                      color: 'secondary.main'
                    }}
                  >
                    Dell Culture Assistant
                  </Typography>
                )}
                <Typography variant="body1">
                  {formatMessageText(msg.text)}
                </Typography>
              </Paper>
            </Box>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <Box
              sx={{
                alignSelf: 'flex-start',
                maxWidth: '80%'
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'secondary.main'
                  }}
                >
                  Dell Culture Assistant
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span className="typing-dot" style={{ backgroundColor: '#9c27b0' }}></span>
                  <span className="typing-dot" style={{ backgroundColor: '#9c27b0' }}></span>
                  <span className="typing-dot" style={{ backgroundColor: '#9c27b0' }}></span>
                </Box>
              </Paper>
            </Box>
          )}
          
          {/* Invisible element to scroll to */}
          <div ref={chatEndRef} />
        </Box>
        
        <Divider />
        
        {/* Input Area */}
        <Box 
          sx={{
            p: 2,
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          {/* Suggestion chips */}
          {chatHistory.length < 3 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commonQuestions.slice(0, 5).map((question, index) => (
                <Chip
                  key={index}
                  label={question}
                  size="medium"
                  onClick={() => handleSuggestionClick(question)}
                  className="suggestion-chip"
                  sx={{
                    cursor: 'pointer',
                    bgcolor: 'secondary.light',
                    color: 'white',
                    '&:hover': { bgcolor: 'secondary.main', transform: 'scale(1.05)' }
                  }}
                />
              ))}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Ask about Dell's culture, values, ethics, or compliance..."
              variant="outlined"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: 'secondary.main',
                    borderWidth: 2
                  }
                }
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              disabled={!userQuery.trim() || isTyping}
              onClick={handleSendMessage}
              sx={{ 
                minWidth: 'auto',
                height: 54,
                width: 54,
                borderRadius: '50%',
                p: 0
              }}
            >
              {isTyping ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </Button>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="caption" color="text.secondary">
          This Culture & Compliance Assistant helps new employees understand Dell's values, ethics, and workplace expectations.
        </Typography>
      </DialogActions>
    </Dialog>
  );
};

export default CultureModal;
