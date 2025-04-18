import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  LinearProgress, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Divider,
  Avatar,
  Paper,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Slider
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const PersonalizedGoals = () => {
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goals, setGoals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGoal, setCurrentGoal] = useState({
    title: '',
    description: '',
    deadline: '',
    progress: 0,
    category: 'professional'
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user data and goals on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoading(false);
          return;
        }
        
        setUserId(currentUser.uid);
        
        // Get user profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
        
        // Load goals from local storage as fallback
        loadGoalsFromStorage(currentUser.uid);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Load goals from local storage
  const loadGoalsFromStorage = (uid) => {
    try {
      const storedGoals = localStorage.getItem('deltri-goals');
      if (storedGoals) {
        const parsedGoals = JSON.parse(storedGoals);
        const userGoals = parsedGoals.filter(goal => goal.userId === uid);
        setGoals(userGoals);
      } else {
        // If no goals exist, create sample goals
        const sampleGoals = [
          {
            id: '1',
            userId: uid,
            title: 'Complete Security Training',
            description: 'Finish all security modules and pass certification exam',
            deadline: '2025-04-30',
            progress: 60,
            category: 'professional'
          },
          {
            id: '2',
            userId: uid,
            title: 'Product Knowledge Certification',
            description: 'Complete product training and demonstrate proficiency',
            deadline: '2025-05-15',
            progress: 20,
            category: 'professional'
          },
          {
            id: '3',
            userId: uid,
            title: 'Team Integration',
            description: 'Schedule meetings with all team members and understand team workflows',
            deadline: '2025-04-25',
            progress: 80,
            category: 'personal'
          }
        ];
        
        localStorage.setItem('deltri-goals', JSON.stringify(sampleGoals));
        setGoals(sampleGoals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };
  
  // Handle dialog open for adding a new goal
  const handleAddGoal = () => {
    setCurrentGoal({
      title: '',
      description: '',
      deadline: '',
      progress: 0,
      category: 'professional'
    });
    setIsEditing(false);
    setOpenDialog(true);
  };
  
  // Handle dialog open for editing an existing goal
  const handleEditGoal = (goal) => {
    setCurrentGoal({...goal});
    setIsEditing(true);
    setOpenDialog(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Handle saving a goal (new or edited)
  const handleSaveGoal = () => {
    try {
      const storedGoals = localStorage.getItem('deltri-goals') || '[]';
      let parsedGoals = JSON.parse(storedGoals);
      
      if (isEditing) {
        // Update existing goal
        parsedGoals = parsedGoals.map(g => g.id === currentGoal.id ? {...currentGoal} : g);
      } else {
        // Add new goal
        const newGoal = {
          ...currentGoal,
          id: Date.now().toString(),
          userId: userId,
          createdAt: new Date().toISOString()
        };
        parsedGoals.push(newGoal);
      }
      
      localStorage.setItem('deltri-goals', JSON.stringify(parsedGoals));
      loadGoalsFromStorage(userId);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      setError('Failed to save goal. Please try again.');
    }
  };
  
  // Handle deleting a goal
  const handleDeleteGoal = (goalId) => {
    try {
      const storedGoals = localStorage.getItem('deltri-goals') || '[]';
      let parsedGoals = JSON.parse(storedGoals);
      
      parsedGoals = parsedGoals.filter(g => g.id !== goalId);
      
      localStorage.setItem('deltri-goals', JSON.stringify(parsedGoals));
      loadGoalsFromStorage(userId);
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal. Please try again.');
    }
  };
  
  // Handle updating goal progress
  const handleUpdateProgress = (goalId, newProgress) => {
    try {
      const storedGoals = localStorage.getItem('deltri-goals') || '[]';
      let parsedGoals = JSON.parse(storedGoals);
      
      parsedGoals = parsedGoals.map(g => {
        if (g.id === goalId) {
          return {...g, progress: newProgress};
        }
        return g;
      });
      
      localStorage.setItem('deltri-goals', JSON.stringify(parsedGoals));
      loadGoalsFromStorage(userId);
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to update progress. Please try again.');
    }
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    switch(category) {
      case 'professional': return 'primary';
      case 'personal': return 'success';
      case 'learning': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : !userId ? (
        <Alert severity="info" sx={{ my: 2 }}>
          Please sign in to access your personalized goals.
        </Alert>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Your Personalized Goals
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddGoal}
            >
              Add New Goal
            </Button>
          </Box>
          
          {userProfile && (
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              Welcome, {userProfile.firstName}! Track your personal and professional goals here.
            </Typography>
          )}
          
          {goals.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No goals yet
              </Typography>
              <Typography variant="body1" paragraph>
                Create your first goal to start tracking your progress.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleAddGoal}
              >
                Add New Goal
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {goals.map((goal) => (
                <Grid item xs={12} md={4} key={goal.id}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
                      transform: 'translateY(-4px)',
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: goal.progress === 100 ? 'success.main' : 'primary.main',
                              mr: 1.5
                            }}
                          >
                            {goal.progress === 100 ? <CheckCircleIcon /> : <FlagIcon />}
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {goal.title}
                          </Typography>
                        </Box>
                        <Chip 
                          label={goal.category} 
                          color={getCategoryColor(goal.category)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {goal.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" fontWeight="medium" color="primary">
                          {goal.progress}% complete
                        </Typography>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={goal.progress} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(0, 0, 0, 0.05)',
                          mb: 2
                        }} 
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          onClick={() => handleEditGoal(goal)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* Add/Edit Goal Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditing ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Goal Title"
                  fullWidth
                  margin="normal"
                  value={currentGoal.title}
                  onChange={(e) => setCurrentGoal({...currentGoal, title: e.target.value})}
                  required
                />
                
                <TextField
                  label="Description"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  value={currentGoal.description}
                  onChange={(e) => setCurrentGoal({...currentGoal, description: e.target.value})}
                />
                
                <TextField
                  label="Deadline"
                  type="date"
                  fullWidth
                  margin="normal"
                  value={currentGoal.deadline}
                  onChange={(e) => setCurrentGoal({...currentGoal, deadline: e.target.value})}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  // Fix for date picker error
                  InputProps={{
                    inputProps: {
                      min: new Date().toISOString().split('T')[0] // Set min date to today
                    }
                  }}
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={currentGoal.category}
                    label="Category"
                    onChange={(e) => setCurrentGoal({...currentGoal, category: e.target.value})}
                  >
                    <MenuItem value="professional">Professional</MenuItem>
                    <MenuItem value="personal">Personal</MenuItem>
                    <MenuItem value="learning">Learning</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Progress: {currentGoal.progress}%
                  </Typography>
                  
                  {/* Draggable progress slider */}
                  <Slider
                    value={currentGoal.progress}
                    onChange={(e, newValue) => setCurrentGoal({...currentGoal, progress: newValue})}
                    aria-labelledby="progress-slider"
                    valueLabelDisplay="auto"
                    step={5}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 25, label: '25%' },
                      { value: 50, label: '50%' },
                      { value: 75, label: '75%' },
                      { value: 100, label: '100%' }
                    ]}
                    min={0}
                    max={100}
                    sx={{
                      '& .MuiSlider-thumb': {
                        height: 24,
                        width: 24,
                        backgroundColor: '#fff',
                        border: '2px solid currentColor',
                        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                          boxShadow: '0 0 0 8px rgba(0, 118, 206, 0.16)',
                        },
                      },
                      '& .MuiSlider-track': {
                        height: 10,
                        borderRadius: 5,
                      },
                      '& .MuiSlider-rail': {
                        height: 10,
                        borderRadius: 5,
                        opacity: 0.5,
                      },
                      '& .MuiSlider-mark': {
                        backgroundColor: '#bfbfbf',
                        height: 8,
                        width: 8,
                        borderRadius: '50%',
                      },
                      '& .MuiSlider-markActive': {
                        opacity: 1,
                        backgroundColor: 'currentColor',
                      },
                    }}
                  />
                  
                  {/* Quick selection buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    {[0, 25, 50, 75, 100].map((value) => (
                      <Button 
                        key={value} 
                        size="small" 
                        variant={currentGoal.progress === value ? "contained" : "outlined"}
                        onClick={() => setCurrentGoal({...currentGoal, progress: value})}
                        sx={{
                          minWidth: '60px',
                          borderRadius: '20px',
                        }}
                      >
                        {value}%
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                onClick={handleSaveGoal} 
                variant="contained"
                disabled={!currentGoal.title || !currentGoal.deadline}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default PersonalizedGoals;
