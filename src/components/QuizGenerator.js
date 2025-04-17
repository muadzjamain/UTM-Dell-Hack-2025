import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Collapse,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { generateQuiz } from '../services/geminiService';

const QuizGenerator = ({ documentContent, documentTitle }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const handleGenerateQuiz = async () => {
    if (!documentContent) {
      setError('No document content available to generate quiz');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQuiz(null);
      setUserAnswers({});
      setSubmitted(false);
      setScore(null);

      // Generate quiz questions using Gemini API
      const quizQuestions = await generateQuiz(documentContent);
      
      setQuiz(quizQuestions);
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;
    
    let correctAnswers = 0;
    quiz.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / quiz.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
  };

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  const toggleExpandQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const isQuestionAnswered = (index) => {
    return userAnswers[index] !== undefined;
  };

  const isAllQuestionsAnswered = () => {
    return quiz && quiz.length > 0 && Object.keys(userAnswers).length === quiz.length;
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Quiz Generator
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Test your knowledge by generating quiz questions based on the document content.
        </Typography>
        
        {documentTitle && (
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Document: <strong>{documentTitle}</strong>
          </Typography>
        )}
        
        {!quiz && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateQuiz}
            disabled={loading || !documentContent}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
            sx={{ mt: 1 }}
          >
            {loading ? 'Generating Quiz...' : 'Generate Quiz'}
          </Button>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
      
      {quiz && quiz.length > 0 && (
        <Box>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                {documentTitle ? `Quiz: ${documentTitle}` : 'Knowledge Quiz'}
              </Typography>
              
              {submitted && score !== null && (
                <Chip 
                  label={`Score: ${score}%`}
                  color={score >= 70 ? 'success' : score >= 50 ? 'warning' : 'error'}
                  sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2, px: 1 }}
                />
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {quiz.map((question, questionIndex) => (
              <Card 
                key={questionIndex} 
                sx={{ 
                  mb: 3, 
                  borderLeft: submitted 
                    ? userAnswers[questionIndex] === question.correctAnswer 
                      ? '4px solid #4caf50' 
                      : '4px solid #f44336'
                    : '4px solid #e0e0e0',
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom>
                      {questionIndex + 1}. {question.question}
                    </Typography>
                    
                    {submitted && (
                      <Box>
                        {userAnswers[questionIndex] === question.correctAnswer ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </Box>
                    )}
                  </Box>
                  
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={userAnswers[questionIndex] !== undefined ? userAnswers[questionIndex] : ''}
                      onChange={(e) => handleAnswerChange(questionIndex, parseInt(e.target.value))}
                    >
                      {question.options.map((option, optionIndex) => (
                        <FormControlLabel
                          key={optionIndex}
                          value={optionIndex}
                          control={<Radio />}
                          label={option}
                          disabled={submitted}
                          sx={{
                            py: 0.5,
                            ...(submitted && optionIndex === question.correctAnswer && {
                              fontWeight: 'bold',
                              color: 'success.main',
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                              borderRadius: 1,
                            })
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                  
                  {submitted && (
                    <Box sx={{ mt: 2 }}>
                      <IconButton
                        onClick={() => toggleExpandQuestion(questionIndex)}
                        aria-expanded={expandedQuestion === questionIndex}
                        aria-label="show explanation"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <ExpandMoreIcon 
                          sx={{ 
                            transform: expandedQuestion === questionIndex ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                          }} 
                        />
                      </IconButton>
                      <Typography variant="button" color="primary">
                        Explanation
                      </Typography>
                      
                      <Collapse in={expandedQuestion === questionIndex}>
                        <Box sx={{ mt: 1, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="body2">
                            The correct answer is <strong>{question.options[question.correctAnswer]}</strong>.
                            {question.explanation ? ` ${question.explanation}` : ''}
                          </Typography>
                        </Box>
                      </Collapse>
                    </Box>
                  )}
                </CardContent>
                
                {!submitted && (
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Chip 
                      label={isQuestionAnswered(questionIndex) ? "Answered" : "Unanswered"} 
                      color={isQuestionAnswered(questionIndex) ? "success" : "default"}
                      size="small"
                    />
                  </CardActions>
                )}
              </Card>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              {!submitted ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitQuiz}
                  disabled={!isAllQuestionsAnswered()}
                  sx={{ minWidth: 120 }}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleReset}
                  sx={{ minWidth: 120 }}
                >
                  Retake Quiz
                </Button>
              )}
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleGenerateQuiz}
                sx={{ minWidth: 120 }}
              >
                Generate New Quiz
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default QuizGenerator;
