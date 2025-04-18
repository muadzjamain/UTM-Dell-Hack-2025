import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  LinearProgress
} from '@mui/material';
import { getLatestQuizScore, getAllQuizScores } from '../services/quizService';

const PerformanceFeedback = () => {
  const [quizScore, setQuizScore] = useState(null);
  const [quizScoreHistory, setQuizScoreHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load quiz scores from localStorage on component mount
  useEffect(() => {
    const loadScores = () => {
      try {
        const latestScore = getLatestQuizScore();
        const allScores = getAllQuizScores();
        
        setQuizScore(latestScore);
        setQuizScoreHistory(allScores);
      } catch (error) {
        console.error('Error loading quiz scores:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Add a small delay to simulate loading
    const timer = setTimeout(() => {
      loadScores();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Analytics data with real quiz score
  const analytics = [
    { label: 'Completion Rate', value: '80%' },
    { 
      label: 'Quiz Scores', 
      value: loading ? '...' : (quizScore !== null ? `${quizScore}%` : '0%') 
    },
    { label: 'Milestones Achieved', value: '5/6' },
  ];
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Performance & Feedback
      </Typography>
      <Typography variant="body1" gutterBottom>
        Track your progress, review feedback, and see your growth over time.
      </Typography>
      <Box my={3}>
        <Grid container spacing={2}>
          {analytics.map((item, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                {item.label === 'Quiz Scores' && loading && (
                  <LinearProgress 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%',
                      height: 4 
                    }} 
                  />
                )}
                <CardContent>
                  <Typography variant="subtitle1" color="text.secondary">{item.label}</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">{item.value}</Typography>
                  
                  {item.label === 'Quiz Scores' && !loading && quizScore !== null && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={quizScore} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: quizScore >= 70 ? 'success.main' : 'warning.main',
                              },
                            }} 
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {quizScore >= 70 ? 'Passed' : 'Needs Review'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>AI-Generated Reports</Typography>
            <Typography variant="body2" paragraph>Dynamic insights into task completion, strengths, and improvement areas.</Typography>
            
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Compliance Knowledge Assessment</Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Loading assessment data...</Typography>
                </Box>
              ) : quizScore === null ? (
                <Typography color="text.secondary">
                  No quiz data available. Complete a compliance quiz to see your assessment.
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" paragraph>
                    Based on your latest compliance quiz score of <strong>{quizScore}%</strong>, 
                    our AI has generated the following insights:
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      {quizScore >= 90 ? 'Excellent Understanding' : 
                       quizScore >= 70 ? 'Good Understanding' : 
                       quizScore >= 50 ? 'Basic Understanding' : 'Needs Improvement'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {quizScore >= 90 ? 
                        'You demonstrate exceptional knowledge of Dell\'s compliance policies and ethical standards. Your understanding helps protect both yourself and the company.' : 
                       quizScore >= 70 ? 
                        'You have a solid grasp of Dell\'s compliance requirements. Consider reviewing specific areas where questions were missed to further strengthen your knowledge.' : 
                       quizScore >= 50 ? 
                        'You understand the basics of Dell\'s compliance policies, but there are significant gaps in your knowledge. We recommend reviewing the compliance materials and retaking the quiz.' : 
                        'Your understanding of Dell\'s compliance requirements needs significant improvement. Please schedule time to review all compliance materials and retake the quiz as soon as possible.'}
                    </Typography>
                  </Box>
                  
                  {quizScoreHistory.length > 1 && (
                    <Box>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Progress Over Time
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {quizScoreHistory[quizScoreHistory.length - 1].score > quizScoreHistory[0].score ?
                          'Your compliance knowledge has improved over time. Keep up the good work!' :
                          quizScoreHistory[quizScoreHistory.length - 1].score < quizScoreHistory[0].score ?
                          'Your compliance knowledge has decreased. Consider reviewing the materials again.' :
                          'Your compliance knowledge has remained consistent.'}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </CardContent>
        </Card>
      </Box>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Quiz History</Typography>
            <Typography variant="body2" paragraph>Your compliance quiz attempts and scores over time.</Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <CircularProgress size={20} />
                <Typography>Loading quiz history...</Typography>
              </Box>
            ) : quizScoreHistory.length === 0 ? (
              <Typography color="text.secondary">
                No quiz history available. Complete a compliance quiz to see your history.
              </Typography>
            ) : (
              <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                {quizScoreHistory.slice().reverse().map((scoreData, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            Quiz Attempt {quizScoreHistory.length - index}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" component="span" color="text.primary">
                              Score: <strong>{scoreData.score}%</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(scoreData.timestamp).toLocaleString()}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={scoreData.score} 
                                  sx={{ 
                                    height: 6, 
                                    borderRadius: 3,
                                    backgroundColor: 'grey.200',
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 3,
                                      backgroundColor: scoreData.score >= 70 ? 'success.main' : 'warning.main',
                                    },
                                  }} 
                                />
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {scoreData.score}%
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < quizScoreHistory.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default PerformanceFeedback;
