import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Divider,
  LinearProgress,
  Chip,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import WorkIcon from '@mui/icons-material/Work';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { auth, db } from '../firebase';
import { updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

// Styled components
const ProfileCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  overflow: 'visible'
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '-60px auto 20px',
  border: `5px solid ${theme.palette.background.paper}`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 'bold',
  backgroundColor: status === 'Completed' ? theme.palette.success.light : 
                   status === 'In Progress' ? theme.palette.info.light : 
                   theme.palette.warning.light,
  color: status === 'Completed' ? theme.palette.success.dark : 
         status === 'In Progress' ? theme.palette.info.dark : 
         theme.palette.warning.dark
}));

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog states
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [departmentDialog, setDepartmentDialog] = useState(false);
  const [roleDialog, setRoleDialog] = useState(false);
  const [forgotPasswordDialog, setForgotPasswordDialog] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentRequest, setDepartmentRequest] = useState('');
  const [roleRequest, setRoleRequest] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Onboarding progress
  const completed = 5;
  const total = 8;
  const percent = Math.round((completed / total) * 100);
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoading(false);
          setError('Please sign in to view your profile');
          return;
        }
        
        setUser(currentUser);
        
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          // Extract name from email if possible
          const emailName = currentUser.email ? currentUser.email.split('@')[0] : '';
          const nameParts = emailName.split('.');
          const firstName = nameParts.length > 0 ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : '';
          const lastName = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : '';
          
          // Create a personalized fallback profile
          const fallbackProfile = {
            firstName: firstName || currentUser.displayName?.split(' ')[0] || 'User',
            lastName: lastName || currentUser.displayName?.split(' ')[1] || '',
            email: currentUser.email,
            role: 'Employee',
            department: 'Dell Technologies',
            startDate: new Date().toISOString().split('T')[0], // Today's date
            onboardingStatus: 'In Progress'
          };
          
          // Save this fallback profile to Firestore for future use
          try {
            await setDoc(doc(db, 'users', currentUser.uid), fallbackProfile);
          } catch (saveErr) {
            console.warn('Could not save fallback profile to Firestore:', saveErr);
          }
          
          setUserProfile(fallbackProfile);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle password change
  const handlePasswordChange = async () => {
    try {
      setPasswordError('');
      
      // Validate passwords
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('All fields are required');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }
      
      if (newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }
      
      // Update password in Firebase Authentication
      await updatePassword(user, newPassword);
      
      // Close dialog and show success message
      setPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      if (err.code === 'auth/requires-recent-login') {
        setPasswordError('For security reasons, please sign in again before changing your password.');
      } else {
        setPasswordError(err.message || 'Failed to update password. Please try again.');
      }
    }
  };
  
  // Handle forgot password
  const handleForgotPassword = async () => {
    try {
      if (!userProfile.email) {
        setError('Email address is required to reset password');
        return;
      }
      
      await sendPasswordResetEmail(auth, userProfile.email);
      setForgotPasswordDialog(false);
      setSuccess('Password reset email sent to ' + userProfile.email);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error sending password reset:', err);
      setError(err.message || 'Failed to send password reset email. Please try again.');
    }
  };
  
  // Handle department change request
  const handleDepartmentRequest = async () => {
    try {
      // In a real app, this would create a request in the database
      // For now, we'll just simulate success
      
      // Close dialog and show success message
      setDepartmentDialog(false);
      setDepartmentRequest('');
      setSuccess('Department change request submitted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error submitting department request:', err);
      setError('Failed to submit request. Please try again.');
    }
  };
  
  // Handle role change request
  const handleRoleRequest = async () => {
    try {
      // In a real app, this would create a request in the database
      // For now, we'll just simulate success
      
      // Close dialog and show success message
      setRoleDialog(false);
      setRoleRequest('');
      setSuccess('Role change request submitted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error submitting role request:', err);
      setError('Failed to submit request. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  if (!userProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="warning">Profile not found. Please complete your registration.</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
      )}
      
      {/* Profile Header */}
      <ProfileCard>
        <CardContent sx={{ textAlign: 'center', pt: 10 }}>
          <ProfileAvatar src="/static/images/avatar/1.jpg">
            {userProfile.firstName?.charAt(0)}{userProfile.lastName?.charAt(0)}
          </ProfileAvatar>
          
          <Typography variant="h4" gutterBottom>
            {userProfile.firstName} {userProfile.lastName}
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {userProfile.role}
          </Typography>
          
          <StatusChip 
            label={userProfile.onboardingStatus || 'In Progress'} 
            status={userProfile.onboardingStatus || 'In Progress'}
          />
          
          <Box sx={{ mt: 3 }}>
            <LinearProgress 
              variant="determinate" 
              value={percent} 
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Onboarding Progress: {percent}% ({completed}/{total} tasks completed)
            </Typography>
          </Box>
        </CardContent>
      </ProfileCard>
      
      {/* User Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ProfileCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <InfoItem>
                <EmailIcon />
                <Box>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{userProfile.email}</Typography>
                </Box>
              </InfoItem>
              
              <InfoItem>
                <WorkIcon />
                <Box>
                  <Typography variant="body2" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{userProfile.department}</Typography>
                </Box>
                <Tooltip title="Request department change">
                  <IconButton 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 'auto' }}
                    onClick={() => setDepartmentDialog(true)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InfoItem>
              
              <InfoItem>
                <BadgeIcon />
                <Box>
                  <Typography variant="body2" color="text.secondary">Role</Typography>
                  <Typography variant="body1">{userProfile.role}</Typography>
                </Box>
                <Tooltip title="Request role change">
                  <IconButton 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 'auto' }}
                    onClick={() => setRoleDialog(true)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InfoItem>
              
              <InfoItem>
                <CalendarTodayIcon />
                <Box>
                  <Typography variant="body2" color="text.secondary">Started at Dell</Typography>
                  <Typography variant="body1">
                    {userProfile.startDate ? new Date(userProfile.startDate).toLocaleDateString() : 'January 15, 2025'}
                  </Typography>
                </Box>
              </InfoItem>
              
              <InfoItem>
                <AssignmentTurnedInIcon />
                <Box>
                  <Typography variant="body2" color="text.secondary">Onboarding Status</Typography>
                  <Typography variant="body1">{userProfile.onboardingStatus || 'In Progress'}</Typography>
                </Box>
              </InfoItem>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<LockIcon />}
                  onClick={() => setPasswordDialog(true)}
                  sx={{ flex: 1 }}
                >
                  Change Password
                </Button>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => setForgotPasswordDialog(true)}
                  sx={{ flex: 1 }}
                >
                  Forgot Password?
                </Button>
              </Box>
            </CardContent>
          </ProfileCard>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ProfileCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Training Progress
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Company Culture & Values" 
                    secondary="Completed on April 10, 2025" 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Chip label="Completed" color="success" size="small" />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Security Protocols" 
                    secondary="Completed on April 12, 2025" 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Chip label="Completed" color="success" size="small" />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Product Knowledge" 
                    secondary="In progress - 60% complete" 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Chip label="In Progress" color="info" size="small" />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Team Collaboration" 
                    secondary="Not started" 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Chip label="Pending" color="warning" size="small" />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Customer Service Excellence" 
                    secondary="Not started" 
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Chip label="Pending" color="warning" size="small" />
                </ListItem>
              </List>
              
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                fullWidth
                href="/training"
              >
                Continue Training
              </Button>
            </CardContent>
          </ProfileCard>
        </Grid>
      </Grid>
      
      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>

        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>
          )}
          <DialogContentText>
            Please enter your current password and a new password to update your credentials.
          </DialogContentText>
          <TextField
            margin="normal"
            label="Current Password"
            type="password"
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <TextField
            margin="normal"
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            margin="normal"
            label="Confirm New Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained" color="primary">
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Department Change Request Dialog */}
      <Dialog open={departmentDialog} onClose={() => setDepartmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Department Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide details about your department change request. Your manager will review this request.
          </DialogContentText>
          <TextField
            margin="normal"
            label="Current Department"
            fullWidth
            value={userProfile.department}
            disabled
          />
          <TextField
            margin="normal"
            label="Requested Department"
            fullWidth
            value={departmentRequest}
            onChange={(e) => setDepartmentRequest(e.target.value)}
            required
          />
          <TextField
            margin="normal"
            label="Reason for Change"
            fullWidth
            multiline
            rows={4}
            placeholder="Please explain why you are requesting this change..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepartmentDialog(false)}>Cancel</Button>
          <Button onClick={handleDepartmentRequest} variant="contained" color="primary">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Role Change Request Dialog */}
      <Dialog open={roleDialog} onClose={() => setRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Role Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide details about your role change request. Your manager will review this request.
          </DialogContentText>
          <TextField
            margin="normal"
            label="Current Role"
            fullWidth
            value={userProfile.role}
            disabled
          />
          <TextField
            margin="normal"
            label="Requested Role"
            fullWidth
            value={roleRequest}
            onChange={(e) => setRoleRequest(e.target.value)}
            required
          />
          <TextField
            margin="normal"
            label="Reason for Change"
            fullWidth
            multiline
            rows={4}
            placeholder="Please explain why you are requesting this change..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleRoleRequest} variant="contained" color="primary">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordDialog} onClose={() => setForgotPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            We'll send a password reset link to your email address: <strong>{userProfile?.email}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleForgotPassword} variant="contained" color="primary">
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
