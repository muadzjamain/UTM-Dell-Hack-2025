import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TimerIcon from '@mui/icons-material/Timer';
import SchoolIcon from '@mui/icons-material/School';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import { generateStudyPlan, generatePDFStudyPlan, generatePlanDates, estimateStudyTime } from '../services/studyPlan';
import { format, addDays } from 'date-fns';

// Learning style options
const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual', description: 'Learns best through images, diagrams, and spatial understanding' },
  { value: 'auditory', label: 'Auditory', description: 'Learns best through listening and speaking' },
  { value: 'reading', label: 'Reading/Writing', description: 'Learns best through reading and writing information' },
  { value: 'kinesthetic', label: 'Kinesthetic', description: 'Learns best through hands-on activities and practice' }
];

const StudyPlanGenerator = ({ content, onClose, onSavePlan, studyPlanHistory = [], onUpdateProgress = () => {}, studyPlan: initialStudyPlan = null }) => {
  console.log('StudyPlanGenerator received initialStudyPlan:', initialStudyPlan);
  const theme = useTheme();
  // If initialStudyPlan is provided, start at step 2 (plan display)
  const [activeStep, setActiveStep] = useState(initialStudyPlan ? 2 : 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize studyPlan state with initialStudyPlan or try to get from localStorage
  const [studyPlan, setStudyPlan] = useState(() => {
    if (initialStudyPlan) {
      console.log('Using initialStudyPlan:', initialStudyPlan);
      return initialStudyPlan;
    }
    
    // Try to get from localStorage as fallback
    const savedPlan = localStorage.getItem('training_studyPlan');
    if (savedPlan) {
      try {
        const parsedPlan = JSON.parse(savedPlan);
        console.log('Using plan from localStorage:', parsedPlan);
        return parsedPlan;
      } catch (e) {
        console.error('Error parsing saved plan:', e);
      }
    }
    
    return null;
  });
  
  // Form state
  const [startDate, setStartDate] = useState(new Date());
  const [difficulty, setDifficulty] = useState(3);
  const [timeAvailable, setTimeAvailable] = useState(120);
  const [daysToComplete, setDaysToComplete] = useState(7);
  const [learningStyle, setLearningStyle] = useState('visual');
  
  // Estimate study time based on content
  const estimatedTime = estimateStudyTime(content);
  
  // Effect to update localStorage when studyPlan changes
  useEffect(() => {
    if (studyPlan) {
      console.log('Saving studyPlan to localStorage:', studyPlan);
      localStorage.setItem('training_studyPlan', JSON.stringify(studyPlan));
    }
  }, [studyPlan]);
  
  // Effect to handle initialStudyPlan changes
  useEffect(() => {
    if (initialStudyPlan) {
      console.log('initialStudyPlan changed, updating state:', initialStudyPlan);
      setStudyPlan(initialStudyPlan);
      setActiveStep(2); // Skip to the plan display step
    }
  }, [initialStudyPlan]);
  
  // Helper function to get learning style label
  const getLearningStyleLabel = (value) => {
    const style = LEARNING_STYLES.find(style => style.value === value);
    return style ? style.label : 'Visual';
  };
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const preferences = {
        difficulty,
        timeAvailable,
        daysToComplete,
        learningStyle
      };
      
      // Check if the content is from a PDF
      const isPDF = content && content.includes('PDF analysis') || content.includes('Analyzing this PDF');
      
      let plan;
      if (isPDF) {
        plan = await generatePDFStudyPlan(content, preferences);
      } else {
        plan = await generateStudyPlan(content, preferences);
      }
      
      setStudyPlan(plan);
      setActiveStep(2);
    } catch (error) {
      console.error('Error generating study plan:', error);
      setError('Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadPlan = () => {
    if (!studyPlan) return;
    
    // Create a formatted text version of the study plan
    let planText = `# Dell Personalized Training Plan\n\n`;
    planText += `## Overview\n${studyPlan.overview}\n\n`;
    
    studyPlan.days.forEach(day => {
      planText += `## Day ${day.day} - ${day.date}\n\n`;
      
      day.sessions.forEach(session => {
        planText += `### ${session.title} (${session.duration} minutes)\n`;
        planText += `Type: ${session.type}\n`;
        if (session.topics && session.topics.length > 0) {
          planText += `Topics: ${session.topics.join(', ')}\n`;
        }
        planText += `${session.description}\n\n`;
      });
    });
    
    planText += `## Study Tips\n`;
    studyPlan.tips.forEach(tip => {
      planText += `- ${tip}\n`;
    });
    
    // Create and download the file
    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dell_Training_Plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Training Plan Preferences
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newDate) => setStartDate(newDate)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDate={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Difficulty Level
                </Typography>
                <Slider
                  value={difficulty}
                  onChange={(e, newValue) => setDifficulty(newValue)}
                  step={1}
                  marks
                  min={1}
                  max={5}
                  valueLabelDisplay="auto"
                  aria-labelledby="difficulty-slider"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Easier</Typography>
                  <Typography variant="caption" color="text.secondary">Harder</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Available Training Time (minutes per day)
                </Typography>
                <Slider
                  value={timeAvailable}
                  onChange={(e, newValue) => setTimeAvailable(newValue)}
                  step={15}
                  marks={[
                    { value: 30, label: '30m' },
                    { value: 60, label: '1h' },
                    { value: 120, label: '2h' },
                    { value: 180, label: '3h' },
                  ]}
                  min={30}
                  max={180}
                  valueLabelDisplay="auto"
                  aria-labelledby="time-slider"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Days to Complete
                </Typography>
                <Slider
                  value={daysToComplete}
                  onChange={(e, newValue) => setDaysToComplete(newValue)}
                  step={1}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 7, label: '7' },
                    { value: 14, label: '14' },
                    { value: 30, label: '30' },
                  ]}
                  min={1}
                  max={30}
                  valueLabelDisplay="auto"
                  aria-labelledby="days-slider"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="learning-style-label">Learning Style</InputLabel>
                  <Select
                    labelId="learning-style-label"
                    id="learning-style"
                    value={learningStyle}
                    label="Learning Style"
                    onChange={(e) => setLearningStyle(e.target.value)}
                  >
                    {LEARNING_STYLES.map((style) => (
                      <MenuItem key={style.value} value={style.value}>
                        {style.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {LEARNING_STYLES.find(style => style.value === learningStyle)?.description}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Estimated training time:</strong> {estimatedTime.studyTime} minutes total
                    <br />
                    <strong>Recommended days:</strong> {estimatedTime.recommendedDays} days (at {Math.ceil(estimatedTime.studyTime / estimatedTime.recommendedDays)} minutes per day)
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {loading ? (
              <>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6">Generating your personalized training plan...</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Creating a personalized training plan based on your preferences...
                </Typography>
              </>
            ) : (
              <>
                {error ? (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                ) : (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Your training plan is ready!
                  </Alert>
                )}
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back to Preferences
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGeneratePlan}
                  disabled={loading}
                >
                  View Plan
                </Button>
              </>
            )}
          </Box>
        );
      
      case 2:
        return (
          <Box>
            {studyPlan && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 500, color: '#1565C0' }}>
                    Your Personalized Training Plan
                  </Typography>
                  
                  <Tooltip title="Download Training Plan">
                    <IconButton onClick={handleDownloadPlan} color="primary">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Card sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TipsAndUpdatesIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Overview
                    </Typography>
                    <Typography variant="body1">{studyPlan.overview}</Typography>
                  </CardContent>
                </Card>
                
                <Typography variant="h6" sx={{ mb: 2 }}>Training Schedule</Typography>
                
                <Box sx={{ mb: 4 }}>
                  {studyPlan.days.map((day) => (
                    <Card key={day.day} sx={{ mb: 2, borderRadius: 2 }}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: theme.palette.primary.main, 
                        color: 'white',
                        borderRadius: '8px 8px 0 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          Day {day.day}
                        </Typography>
                        <Typography variant="body1">
                          {day.date}
                        </Typography>
                      </Box>
                      
                      <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {day.sessions.map((session, index) => (
                            <Box key={index} sx={{ 
                              p: 2, 
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                              bgcolor: session.type === 'break' 
                                ? 'rgba(76, 175, 80, 0.1)' 
                                : session.type === 'review'
                                  ? 'rgba(33, 150, 243, 0.1)'
                                  : session.type === 'practice'
                                    ? 'rgba(156, 39, 176, 0.1)'
                                    : 'rgba(255, 152, 0, 0.1)'
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Checkbox 
                                    checked={studyPlan.completedSessions?.includes(`${day.day}-${index}`) || false}
                                    onChange={(e) => {
                                      const sessionId = `${day.day}-${index}`;
                                      const newPlan = {...studyPlan};
                                      
                                      if (!newPlan.completedSessions) {
                                        newPlan.completedSessions = [];
                                      }
                                      
                                      if (e.target.checked) {
                                        if (!newPlan.completedSessions.includes(sessionId)) {
                                          newPlan.completedSessions.push(sessionId);
                                        }
                                      } else {
                                        newPlan.completedSessions = newPlan.completedSessions.filter(id => id !== sessionId);
                                      }
                                      
                                      // Calculate progress percentage
                                      const totalSessions = studyPlan.days.reduce((total, d) => total + d.sessions.length, 0);
                                      newPlan.progress = Math.round((newPlan.completedSessions.length / totalSessions) * 100);
                                      
                                      setStudyPlan(newPlan);
                                      onUpdateProgress(newPlan);
                                    }}
                                    sx={{ 
                                      color: '#1565C0',
                                      '&.Mui-checked': {
                                        color: '#1565C0',
                                      },
                                    }}
                                  />
                                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                    Training Session {index + 1}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={`${session.duration} min`} 
                                  size="small" 
                                  icon={<TimerIcon />}
                                  color={session.type === 'break' ? 'success' : 'primary'}
                                  variant="outlined"
                                />
                              </Box>
                              
                              {session.topics && session.topics.length > 0 && (
                                <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {session.topics.map((topic, i) => (
                                    <Chip 
                                      key={i} 
                                      label={topic} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ bgcolor: 'background.paper' }}
                                    />
                                  ))}
                                </Box>
                              )}
                              
                              <Typography variant="body2">
                                {session.description}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                
                <Card sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(33, 150, 243, 0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SchoolIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Training Tips
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {studyPlan.tips.map((tip, index) => (
                        <Typography component="li" key={index} variant="body1" sx={{ mb: 1 }}>
                          {tip}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </>
            )}
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, color: '#1565C0', fontWeight: 500 }}>
        Create Personalized Training Plan
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Set Preferences</StepLabel>
        </Step>
        <Step>
          <StepLabel>Generate Plan</StepLabel>
        </Step>
        <Step>
          <StepLabel>View Plan</StepLabel>
        </Step>
      </Stepper>
      
      {getStepContent(activeStep)}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        {activeStep !== 1 && (
          <>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            
            {activeStep === 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleGeneratePlan}
                disabled={loading}
              >
                Generate Training Plan
              </Button>
            )}
            
            {activeStep === 2 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Save the current study plan to history before closing
                  if (studyPlan) {
                    // Add timestamp and title for history identification
                    const planWithMeta = {
                      ...studyPlan,
                      timestamp: new Date().toISOString(),
                      title: `Training Plan (${format(new Date(), 'MMM d, yyyy')})`
                    };
                    onSavePlan(planWithMeta);
                  }
                  // Reset to preferences step without closing
                  setActiveStep(0);
                  // Clear the current study plan to start fresh
                  setStudyPlan(null);
                }}
              >
                Done
              </Button>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default StudyPlanGenerator;
