import React from 'react';
import { Container, Typography, Box, Button, Card, CardContent } from '@mui/material';

const FinalReview = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Final Review & Feedback
      </Typography>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Completion Summary</Typography>
            <Typography variant="body2">Full module status and completion details.</Typography>
          </CardContent>
        </Card>
      </Box>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Employee Feedback Form</Typography>
            <Typography variant="body2">Share your onboarding experience.</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>Submit Feedback</Button>
          </CardContent>
        </Card>
      </Box>
      <Box my={3} textAlign="center">
        <Typography variant="h6">Thank You!</Typography>
        <Typography variant="body2">We appreciate your feedback and hope you had a great onboarding experience.</Typography>
      </Box>
    </Container>
  );
};

export default FinalReview;
