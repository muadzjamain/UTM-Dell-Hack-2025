import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert, 
  Link, 
  Paper, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar
} from '@mui/material';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetError, setResetError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = () => {
    navigate('/register');
  };

  const handleForgotPasswordOpen = () => {
    setResetEmail(email); // Pre-fill with the email from login form if available
    setForgotPasswordOpen(true);
    setResetError(null);
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetEmailSent(true);
      setTimeout(() => {
        setForgotPasswordOpen(false);
        setResetEmailSent(false);
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setResetError(err.message || 'Failed to send password reset email. Please try again.');
    }
  };

  const handleSnackbarClose = () => {
    setResetEmailSent(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Welcome to Deltri
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
          Sign in to continue your onboarding journey
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Link
              href="#"
              onClick={handleForgotPasswordOpen}
              underline="hover"
              variant="body2"
              sx={{ cursor: 'pointer' }}
            >
              Forgot password?
            </Link>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link 
                href="#" 
                onClick={handleRegister} 
                underline="hover"
                sx={{ cursor: 'pointer' }}
              >
                Create an account
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onClose={handleForgotPasswordClose}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your email address and we'll send you a link to reset your password.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="resetEmail"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            error={!!resetError}
            helperText={resetError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleForgotPasswordClose}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" color="primary">
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={resetEmailSent}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Password reset email sent! Check your inbox."
      />
    </Container>
  );
};

export default Login;
