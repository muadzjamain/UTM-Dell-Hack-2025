import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  IconButton, 
  Typography, 
  Avatar, 
  Fab, 
  Zoom, 
  Fade,
  CircularProgress,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { generateResponse } from '../services/geminiService';

const ChatAssistant = ({ userInfo }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your AI onboarding assistant. How can I help you today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Convert previous messages to Gemini API format
      const context = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Create a prompt with context about the user and their onboarding
      const userContext = userInfo ? 
        `The user is ${userInfo.name}, a ${userInfo.role} in the ${userInfo.department} department. ` +
        `They are currently at ${userInfo.progress}% of their onboarding process.` : 
        '';

      const prompt = `${userContext}\n\nUser message: ${input}`;
      
      // Get response from Gemini API
      const response = await generateResponse(prompt, context);
      
      // Add assistant response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.parts[0].text 
      }]);
    } catch (error) {
      // Add error message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
      console.error('Error getting response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: 'Chat has been reset. How can I help you with your onboarding today?' 
      }
    ]);
  };

  return (
    <>
      {/* Chat button */}
      <Zoom in={!open}>
        <Fab 
          color="primary" 
          aria-label="chat"
          onClick={() => setOpen(true)}
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20,
            boxShadow: '0 4px 12px rgba(0, 118, 206, 0.3)'
          }}
        >
          <SmartToyIcon />
        </Fab>
      </Zoom>

      {/* Chat window */}
      <Fade in={open}>
        <Paper 
          elevation={6} 
          sx={{ 
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 350,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            zIndex: 1300
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SmartToyIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Onboarding Assistant</Typography>
            </Box>
            <Box>
              <IconButton 
                size="small" 
                color="inherit" 
                onClick={resetChat}
                sx={{ mr: 1 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="inherit" 
                onClick={() => setOpen(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          {/* Messages */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              p: 2, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: '#f5f8fa'
            }}
          >
            {messages.map((message, index) => (
              <Box 
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: message.role === 'user' ? 'secondary.main' : 'primary.main',
                    width: 32,
                    height: 32
                  }}
                >
                  {message.role === 'user' ? 'U' : <SmartToyIcon fontSize="small" />}
                </Avatar>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 1.5, 
                    maxWidth: '75%',
                    bgcolor: message.role === 'user' ? 'secondary.light' : 'white',
                    color: message.role === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    borderTopLeftRadius: message.role === 'assistant' ? 0 : 2,
                    borderTopRightRadius: message.role === 'user' ? 0 : 2,
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32
                  }}
                >
                  <SmartToyIcon fontSize="small" />
                </Avatar>
                <CircularProgress size={20} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          
          <Divider />
          
          {/* Input */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              variant="outlined"
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
            <IconButton 
              color="primary" 
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Fade>
    </>
  );
};

export default ChatAssistant;
