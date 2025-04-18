import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography, 
  Button, 
  Box, 
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Divider,
  CircularProgress,
  Avatar,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TimerIcon from '@mui/icons-material/Timer';
import { generateComplianceQuiz, saveQuizScore } from '../services/quizService';

/**
 * Compliance Quiz Modal component that provides an AI-generated quiz
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Function to call when closing the modal
 */
const ComplianceQuizModal = ({ open, onClose }) => {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(30); // 30 seconds per question
  const [timerActive, setTimerActive] = useState(false);
  
  // Generate quiz questions when modal opens
  useEffect(() => {
    if (open) {
      const loadQuiz = async () => {
        setLoading(true);
        setQuizQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        setScore(0);
        setQuizCompleted(false);
        setTimeRemaining(30);
        setTimerActive(false);
        
        try {
          // Generate 10 questions for the quiz
          const questions = await generateComplianceQuiz(10);
          setQuizQuestions(questions);
          setLoading(false);
          setTimerActive(true);
        } catch (error) {
          console.error('Error loading quiz:', error);
          setLoading(false);
        }
      };
      
      loadQuiz();
    }
  }, [open]);
  
  // Timer countdown effect
  useEffect(() => {
    let timer;
    if (timerActive && timeRemaining > 0 && !quizCompleted && !loading) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !isAnswerSubmitted && !quizCompleted && !loading) {
      // Time's up for this question
      handleSubmitAnswer();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timerActive, timeRemaining, isAnswerSubmitted, quizCompleted, loading]);
  
  // Handle answer selection
  const handleAnswerSelect = (index) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(index);
    }
  };
  
  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (quizQuestions.length === 0) return;
    
    setIsAnswerSubmitted(true);
    setTimerActive(false);
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };
  
  // Handle moving to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setTimeRemaining(30);
      setTimerActive(true);
    } else {
      // Quiz completed
      const finalScore = ((score + (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer ? 1 : 0)) / quizQuestions.length) * 100;
      const roundedScore = Math.round(finalScore);
      setQuizCompleted(true);
      
      // Save the score
      saveQuizScore(roundedScore);
    }
  };
  
  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    return ((currentQuestionIndex + (isAnswerSubmitted ? 1 : 0)) / quizQuestions.length) * 100;
  };
  
  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      setTimerActive(false);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      className="modal-enter"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          minHeight: '70vh'
        }
      }}
    >
      {/* Header */}
      <DialogTitle 
        sx={{ 
          bgcolor: 'warning.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'warning.dark' }}>
            <QuizIcon />
          </Avatar>
          <Typography variant="h6">Dell Compliance Quiz</Typography>
        </Box>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={handleClose} 
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Quiz Progress Bar */}
      <LinearProgress 
        variant="determinate" 
        value={calculateProgress()} 
        sx={{ height: 6 }}
        color="warning"
      />
      
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="warning" size={60} sx={{ mb: 3 }} />
            <Typography variant="h6">Generating Compliance Quiz...</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Our AI is creating challenging questions to test your knowledge
            </Typography>
          </Box>
        ) : quizCompleted ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <CircularProgress 
                variant="determinate" 
                value={100} 
                size={120} 
                thickness={4}
                sx={{ color: 'grey.300' }}
              />
              <CircularProgress 
                variant="determinate" 
                value={(score / quizQuestions.length) * 100} 
                size={120} 
                thickness={4}
                sx={{ 
                  color: (score / quizQuestions.length) >= 0.7 ? 'success.main' : 'error.main',
                  position: 'absolute',
                  left: 0,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4" component="div" color="text.primary">
                  {Math.round((score / quizQuestions.length) * 100)}%
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h5" gutterBottom>
              Quiz Completed!
            </Typography>
            
            <Typography variant="body1" paragraph>
              You answered <strong>{score}</strong> out of <strong>{quizQuestions.length}</strong> questions correctly.
            </Typography>
            
            {(score / quizQuestions.length) >= 0.7 ? (
              <Box sx={{ mt: 2, mb: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" color="success.main">
                  Congratulations! You passed the compliance quiz.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Your score has been recorded and will appear in your performance dashboard.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2, mb: 4 }}>
                <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                <Typography variant="h6" color="error.main">
                  You didn't pass the compliance quiz.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  We recommend reviewing Dell's compliance policies and trying again.
                </Typography>
              </Box>
            )}
            
            <Button 
              variant="contained" 
              color="warning" 
              onClick={handleClose}
              sx={{ mt: 2 }}
            >
              Close
            </Button>
          </Box>
        ) : (
          <>
            {/* Question Counter and Timer */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip 
                label={`Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`} 
                color="warning" 
                variant="outlined"
              />
              <Chip 
                icon={<TimerIcon />} 
                label={formatTimeRemaining()} 
                color={timeRemaining < 10 ? "error" : "default"} 
                variant="outlined"
                sx={{ 
                  transition: 'all 0.2s ease',
                  ...(timeRemaining < 10 && { animation: 'pulse 1s infinite' })
                }}
              />
            </Box>
            
            {/* Question */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                bgcolor: 'warning.50'
              }}
            >
              <Typography variant="h6" gutterBottom>
                {quizQuestions[currentQuestionIndex]?.question}
              </Typography>
            </Paper>
            
            {/* Answer Options */}
            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
              <RadioGroup value={selectedAnswer}>
                {quizQuestions[currentQuestionIndex]?.options.map((option, index) => (
                  <Paper
                    key={index}
                    elevation={1}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: isAnswerSubmitted
                        ? index === quizQuestions[currentQuestionIndex].correctAnswer
                          ? 'success.main'
                          : selectedAnswer === index && selectedAnswer !== quizQuestions[currentQuestionIndex].correctAnswer
                            ? 'error.main'
                            : 'divider'
                        : selectedAnswer === index
                          ? 'warning.main'
                          : 'divider',
                      bgcolor: isAnswerSubmitted
                        ? index === quizQuestions[currentQuestionIndex].correctAnswer
                          ? 'success.50'
                          : selectedAnswer === index && selectedAnswer !== quizQuestions[currentQuestionIndex].correctAnswer
                            ? 'error.50'
                            : 'background.paper'
                        : selectedAnswer === index
                          ? 'warning.50'
                          : 'background.paper',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FormControlLabel
                      value={index}
                      control={
                        <Radio 
                          color={
                            isAnswerSubmitted
                              ? index === quizQuestions[currentQuestionIndex].correctAnswer
                                ? "success"
                                : selectedAnswer === index && selectedAnswer !== quizQuestions[currentQuestionIndex].correctAnswer
                                  ? "error"
                                  : "warning"
                              : "warning"
                          }
                          checked={selectedAnswer === index}
                          onChange={() => handleAnswerSelect(index)}
                          disabled={isAnswerSubmitted}
                        />
                      }
                      label={
                        <Typography 
                          variant="body1"
                          sx={{
                            fontWeight: selectedAnswer === index ? 'bold' : 'normal'
                          }}
                        >
                          {option}
                        </Typography>
                      }
                      sx={{ 
                        py: 1, 
                        px: 2, 
                        m: 0,
                        width: '100%'
                      }}
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>
          </>
        )}
      </DialogContent>
      
      {!loading && !quizCompleted && (
        <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
          {isAnswerSubmitted ? (
            <Button 
              variant="contained" 
              color="warning" 
              onClick={handleNextQuestion}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="warning" 
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Submit Answer
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ComplianceQuizModal;
