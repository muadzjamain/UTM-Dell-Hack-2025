import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  IconButton,
  TextField,
  Chip
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import Draggable from 'react-draggable';
import { getDellAssistantResponse } from '../services/geminiService';
import { auth } from '../firebase';

const DellAssistant = ({ userProfile }) => {
  // Add custom CSS to prevent text selection during drag
  useLayoutEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.innerHTML = `
      .drag-handle {
        cursor: move;
      }
      .drag-handle .no-drag {
        cursor: default;
      }
      .drag-handle * {
        user-select: none;
      }
      .no-drag, .no-drag * {
        user-select: text;
      }
      .no-drag input, .no-drag textarea {
        cursor: text;
      }
      .no-drag button, .no-drag a, .no-drag [role="button"] {
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi there! I\'m your Dell onboarding assistant. How can I help you today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const nodeRef = useRef(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle sending a message
  const handleSendMessage = (text = userInput) => {
    if (!text.trim()) return;
    
    // Add user message to chat
    const userMessage = { sender: 'user', text: text.trim() };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsTyping(true);
    
    // Get response from Gemini API
    getDellAssistantResponse(text.trim(), chatMessages, userProfile)
      .then(response => {
        // Add bot response to chat
        setChatMessages(prev => [...prev, { sender: 'bot', text: response }]);
        setIsTyping(false);
      })
      .catch(error => {
        console.error('Error getting assistant response:', error);
        setChatMessages(prev => [...prev, { 
          sender: 'bot', 
          text: 'Sorry, I encountered an error. Please try again later.' 
        }]);
        setIsTyping(false);
      });
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message text with line breaks
  const formatMessageText = (text) => {
    return text.split('\\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <Draggable nodeRef={nodeRef} bounds="parent" handle=".drag-handle">
      <Box
        ref={nodeRef}
        className="drag-handle"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          width: isChatOpen ? 380 : 65,
          height: isChatOpen ? 580 : 65,
          borderRadius: isChatOpen ? '16px' : '50%',
          bgcolor: 'white',
          boxShadow: isChatOpen ? 
            '0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,118,206,0.05)' : 
            '0 10px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transform: 'scale(1)',
          border: 'none',
          '&:hover': {
            transform: isChatOpen ? 'scale(1)' : 'scale(1.05)',
            boxShadow: isChatOpen ? 
              '0 15px 50px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,118,206,0.08)' : 
              '0 15px 50px rgba(0,0,0,0.25)'
          },
          '&::before': isChatOpen ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '16px',
            padding: '1px',
            background: 'linear-gradient(135deg, rgba(0,118,206,0.2), rgba(21,101,192,0.05))',
            '-webkit-mask': 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            '-webkit-mask-composite': 'xor',
            'mask-composite': 'exclude',
            pointerEvents: 'none'
          } : {}
        }}
      >
        {/* Chat Header - Draggable Area */}
        <Box 
          className="drag-handle"
          sx={{
            background: 'linear-gradient(135deg, #0076CE, #1565C0)',
            color: 'white',
            p: isChatOpen ? 2 : 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'move',
            height: isChatOpen ? 'auto' : '100%',
            borderRadius: isChatOpen ? '16px 16px 0 0' : '50%',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderBottom: isChatOpen ? '1px solid rgba(0,0,0,0.08)' : 'none',
            position: 'relative',
            overflow: 'hidden',
            '&::before': isChatOpen ? {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              opacity: 0.7,
              pointerEvents: 'none'
            } : {}
          }}
        >
          {isChatOpen ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'white', 
                    width: 38, 
                    height: 38,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    border: '2px solid rgba(255,255,255,0.8)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  <SmartToyIcon fontSize="small" sx={{ color: '#0076CE' }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Dell Assistant</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box 
                      sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: '#4caf50',
                        boxShadow: '0 0 0 2px rgba(255,255,255,0.5)'
                      }} 
                    />
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Online</Typography>
                  </Box>
                </Box>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setIsChatOpen(false)}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  width: 32,
                  height: 32,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.25)',
                    transform: 'rotate(90deg)'
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <Box 
              sx={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #0076CE, #1565C0)',
                borderRadius: '50%',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '150%',
                  height: '150%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)',
                  top: '-25%',
                  left: '-25%',
                  opacity: 0.7
                },
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 'inset 0 0 15px rgba(255,255,255,0.3)'
                },
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(0, 118, 206, 0.4)'
                  },
                  '70%': {
                    boxShadow: '0 0 0 10px rgba(0, 118, 206, 0)'
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(0, 118, 206, 0)'
                  }
                }
              }}
              onClick={() => setIsChatOpen(true)}
            >
              <SmartToyIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          )}
        </Box>

        {isChatOpen && (
          <>
            {/* Messages Container */}
            <Box 
              className="no-drag"
              onClick={(e) => e.stopPropagation()}
              sx={{
                flexGrow: 1,
                p: 2.5,
                overflowY: 'auto',
                bgcolor: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                background: `
                  linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)),
                  url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231565C0' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
                `,
                backgroundSize: '60px 60px'
              }}
            >
              {/* Dell Assistant Intro Card */}
              {chatMessages.length === 1 && (
                <Box 
                  sx={{
                    bgcolor: 'rgba(21, 101, 192, 0.05)',
                    borderRadius: 3,
                    p: 2.5,
                    mb: 2,
                    border: '1px solid rgba(21, 101, 192, 0.1)',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                    Dell Assistant
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Hi there! I'm your Dell onboarding assistant. How can I help you today?
                  </Typography>
                </Box>
              )}
              
              {/* Regular Chat Messages */}
              {chatMessages.slice(chatMessages.length === 1 ? 1 : 0).map((msg, index) => (
                <Box 
                  key={index} 
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  <Box 
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    {/* Avatar */}
                    {msg.sender === 'bot' ? (
                      <Avatar 
                        sx={{ 
                          bgcolor: '#0076CE', 
                          width: 32, 
                          height: 32,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        <SmartToyIcon sx={{ fontSize: 18, color: 'white' }} />
                      </Avatar>
                    ) : (
                      <Avatar 
                        sx={{ 
                          bgcolor: 'grey.200', 
                          width: 32, 
                          height: 32
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                          {userProfile?.firstName?.charAt(0) || auth.currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </Typography>
                      </Avatar>
                    )}
                    
                    {/* Message Bubble */}
                    <Box 
                      sx={{
                        bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
                        color: msg.sender === 'user' ? 'white' : 'text.primary',
                        borderRadius: 3,
                        p: 2,
                        maxWidth: '75%',
                        boxShadow: msg.sender === 'user' ? 
                          '0 2px 8px rgba(21, 101, 192, 0.2)' : 
                          '0 2px 8px rgba(0, 0, 0, 0.05)',
                        border: msg.sender === 'user' ? 'none' : '1px solid rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                        {formatMessageText(msg.text)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
              <div ref={chatEndRef} />
              
              {/* Typing Indicator */}
              {isTyping && (
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 1
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: '#0076CE', 
                      width: 32, 
                      height: 32
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: 18, color: 'white' }} />
                  </Avatar>
                  <Box 
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 3,
                      p: 2,
                      display: 'flex',
                      gap: 0.5,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <Box 
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        animation: 'pulse 1s infinite',
                        animationDelay: '0s',
                        '@keyframes pulse': {
                          '0%, 100%': {
                            opacity: 0.5,
                            transform: 'scale(0.8)'
                          },
                          '50%': {
                            opacity: 1,
                            transform: 'scale(1)'
                          }
                        }
                      }}
                    />
                    <Box 
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        animation: 'pulse 1s infinite',
                        animationDelay: '0.2s',
                        '@keyframes pulse': {
                          '0%, 100%': {
                            opacity: 0.5,
                            transform: 'scale(0.8)'
                          },
                          '50%': {
                            opacity: 1,
                            transform: 'scale(1)'
                          }
                        }
                      }}
                    />
                    <Box 
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        animation: 'pulse 1s infinite',
                        animationDelay: '0.4s',
                        '@keyframes pulse': {
                          '0%, 100%': {
                            opacity: 0.5,
                            transform: 'scale(0.8)'
                          },
                          '50%': {
                            opacity: 1,
                            transform: 'scale(1)'
                          }
                        }
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
            
            {/* Suggestion Chips */}
            {chatMessages.length < 3 && (
              <Box 
                className="no-drag"
                onClick={(e) => e.stopPropagation()}
                sx={{ 
                  p: 2, 
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                  bgcolor: 'rgba(0, 0, 0, 0.01)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: 'center'
                }}
              >
                {[
                  'How do I access my training?',
                  'What benefits do I have?',
                  'Who is my manager?',
                  'IT support contact?'
                ].map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    size="medium"
                    onClick={() => {
                      setUserInput(suggestion);
                      handleSendMessage(suggestion);
                    }}
                    sx={{ 
                      cursor: 'pointer',
                      borderRadius: 3,
                      py: 0.5,
                      fontWeight: 500,
                      bgcolor: 'white',
                      border: '1px solid rgba(21, 101, 192, 0.2)',
                      color: 'primary.main',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(21, 101, 192, 0.3)'
                      }
                    }}
                  />
                ))}
              </Box>
            )}
            
            {/* Input Area */}
            <Box 
              className="no-drag"
              onClick={(e) => e.stopPropagation()}
              sx={{
                p: 2,
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <TextField
                fullWidth
                size="medium"
                placeholder="Type your question..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.03)'
                    },
                    '&.Mui-focused': {
                      bgcolor: 'white'
                    }
                  }
                }}
              />
              <IconButton 
                color="primary" 
                onClick={() => handleSendMessage()}
                disabled={!userInput.trim() || isTyping}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 44,
                  height: 44,
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Draggable>
  );
};

export default DellAssistant;
