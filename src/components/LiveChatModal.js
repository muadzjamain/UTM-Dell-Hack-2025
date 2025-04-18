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
  CircularProgress,
  Badge
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { getLiveChatResponse, getCommonLiveChatQuestions } from '../services/liveChatService';

/**
 * Live Chat Modal component that provides an AI-powered chat interface with option to request human agent
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Function to call when closing the modal
 */
const LiveChatModal = ({ open, onClose }) => {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      id: 'welcome', 
      sender: 'bot', 
      text: "Hello! I'm your Dell Support Agent. I'm here to help with your onboarding process. How can I assist you today?",
      isBot: true
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [humanRequested, setHumanRequested] = useState(false);
  const [humanConnecting, setHumanConnecting] = useState(false);
  const chatEndRef = useRef(null);
  const commonQuestions = getCommonLiveChatQuestions();

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (userMessage.trim() === '') return;
    
    // Store the current message before clearing it
    const currentMessage = userMessage;
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: currentMessage 
    }]);
    
    // Clear input field immediately for better UX
    setUserMessage('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // If human has been requested and connected, simulate human response
    if (humanRequested) {
      // Simulate longer response time for human agent
      setTimeout(() => {
        // Add human agent response
        setChatHistory(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          sender: 'human', 
          text: "Thank you for your message. This is a simulated human agent response. In a real implementation, this would connect to a live human agent system. How else can I help you with your onboarding process?",
          isHuman: true
        }]);
        // Hide typing indicator
        setIsTyping(false);
      }, 2000 + Math.random() * 2000); // Random delay between 2-4 seconds for human feel
    } else {
      try {
        // Get response from Gemini AI
        const response = await getLiveChatResponse(currentMessage, chatHistory);
        
        // Add a slight delay to simulate natural typing
        setTimeout(() => {
          // Add the response to chat
          setChatHistory(prev => [...prev, { 
            id: (Date.now() + 1).toString(), 
            sender: 'bot', 
            text: response,
            isBot: true
          }]);
          // Hide typing indicator
          setIsTyping(false);
        }, 800 + Math.random() * 1200); // Random delay between 800-2000ms for natural feel
        
      } catch (error) {
        console.error('Error getting live chat response:', error);
        
        // Add error message to chat after a slight delay
        setTimeout(() => {
          setChatHistory(prev => [...prev, { 
            id: (Date.now() + 1).toString(), 
            sender: 'bot', 
            text: "I'm sorry, I'm having trouble processing your request right now. Please try again or consider requesting a human agent for assistance.",
            isBot: true,
            isError: true
          }]);
          setIsTyping(false);
        }, 800);
      }
    }
  };

  // Handle requesting a human agent
  const handleRequestHuman = () => {
    // Add system message about human request
    setChatHistory(prev => [...prev, { 
      id: Date.now().toString(), 
      sender: 'system', 
      text: "You've requested to speak with a human agent. Please wait while we connect you...",
      isSystem: true
    }]);
    
    setHumanConnecting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      // Add human agent connected message
      setChatHistory(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        sender: 'human', 
        text: "Hello, I'm a Dell Support representative. How can I assist you with your onboarding process today?",
        isHuman: true
      }]);
      setHumanConnecting(false);
      setHumanRequested(true);
    }, 3000); // 3 second delay to simulate connecting to human
  };

  // Handle key press in chat input (send on Enter)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (userMessage.trim()) {
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
    setUserMessage(suggestion);
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
          bgcolor: 'grey.800', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'grey.600' }}>
            <ChatIcon />
          </Avatar>
          <Typography variant="h6">Dell Support {humanRequested && "- Human Agent"}</Typography>
          {humanRequested && (
            <Badge
              sx={{ ml: 1 }}
              badgeContent="Human"
              color="success"
            />
          )}
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
                minWidth: msg.sender === 'system' ? '60%' : '30%',
                ...(msg.sender === 'system' && { 
                  alignSelf: 'center',
                  opacity: 0.8
                })
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: msg.sender === 'user' 
                    ? 'grey.700' 
                    : msg.sender === 'system'
                    ? 'grey.200'
                    : 'white',
                  color: msg.sender === 'user' 
                    ? 'white' 
                    : msg.sender === 'system'
                    ? 'text.secondary'
                    : 'text.primary',
                  position: 'relative',
                  ...(msg.sender !== 'system' && {
                    '&::before': msg.sender === 'bot' || msg.sender === 'human' ? {
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
                      borderColor: 'transparent transparent transparent grey.700',
                    } : {}
                  })
                }}
              >
                {(msg.sender === 'bot' || msg.sender === 'human') && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.5 }}>
                    {msg.isHuman ? (
                      <>
                        <PersonIcon fontSize="small" color="success" />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: 'success.main'
                          }}
                        >
                          Human Agent
                        </Typography>
                      </>
                    ) : (
                      <>
                        <SmartToyIcon fontSize="small" color="primary" />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: 'primary.main'
                          }}
                        >
                          Dell Support AI
                        </Typography>
                      </>
                    )}
                  </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {humanRequested ? (
                    <>
                      <PersonIcon fontSize="small" color="success" />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'success.main'
                        }}
                      >
                        Human Agent
                      </Typography>
                    </>
                  ) : (
                    <>
                      <SmartToyIcon fontSize="small" color="primary" />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'primary.main'
                        }}
                      >
                        Dell Support AI
                      </Typography>
                    </>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span className="typing-dot" style={{ backgroundColor: humanRequested ? '#2e7d32' : '#1976d2' }}></span>
                  <span className="typing-dot" style={{ backgroundColor: humanRequested ? '#2e7d32' : '#1976d2' }}></span>
                  <span className="typing-dot" style={{ backgroundColor: humanRequested ? '#2e7d32' : '#1976d2' }}></span>
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
          {/* Request Human Agent Button - only show if not already requested */}
          {!humanRequested && !humanConnecting && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                color="success"
                startIcon={<PersonIcon />}
                onClick={handleRequestHuman}
                sx={{ 
                  borderRadius: 4,
                  px: 3,
                  '&:hover': { 
                    bgcolor: 'success.light', 
                    color: 'white',
                    borderColor: 'success.light'
                  }
                }}
              >
                Request Human Agent
              </Button>
            </Box>
          )}
          
          {/* Human connecting indicator */}
          {humanConnecting && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="success" />
              <Typography variant="body2" color="success.main">
                Connecting to human agent...
              </Typography>
            </Box>
          )}
          
          {/* Suggestion chips */}
          {chatHistory.length < 3 && !humanRequested && !humanConnecting && (
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
                    bgcolor: 'grey.100',
                    '&:hover': { bgcolor: 'grey.700', color: 'white', transform: 'scale(1.05)' }
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
              placeholder={humanRequested 
                ? "Type your message to the human agent..." 
                : "Type your question about onboarding at Dell..."
              }
              variant="outlined"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping || humanConnecting}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: humanRequested ? 'success.main' : 'grey.700',
                    borderWidth: 2
                  }
                }
              }}
            />
            <Button
              variant="contained"
              color={humanRequested ? "success" : "inherit"}
              disabled={!userMessage.trim() || isTyping || humanConnecting}
              onClick={handleSendMessage}
              sx={{ 
                minWidth: 'auto',
                height: 54,
                width: 54,
                borderRadius: '50%',
                p: 0,
                bgcolor: humanRequested ? 'success.main' : 'grey.700',
                '&:hover': {
                  bgcolor: humanRequested ? 'success.dark' : 'grey.900',
                }
              }}
            >
              {isTyping || humanConnecting ? (
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
          {humanRequested 
            ? "You are now chatting with a human support agent. Response times may vary."
            : "This chat is powered by AI. You can request a human agent using the button above."
          }
        </Typography>
      </DialogActions>
    </Dialog>
  );
};

export default LiveChatModal;
