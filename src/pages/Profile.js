import React from 'react';
import { Container, Typography, Box, Card, CardContent, LinearProgress } from '@mui/material';

const Profile = () => {
  // Placeholder data for progress and AI-generated feedback
  const completed = 5;
  const total = 8;
  const percent = Math.round((completed / total) * 100);
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Training Checklist</Typography>
            <ul>
              <li>Module 1: Complete</li>
              <li>Module 2: Complete</li>
              <li>Module 3: In Progress</li>
              <li>Module 4: Not Started</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Statistics</Typography>
            <LinearProgress variant="determinate" value={percent} sx={{ height: 8, borderRadius: 4, my: 1 }} />
            <Typography variant="caption">{percent}% complete</Typography>
          </CardContent>
        </Card>
      </Box>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">AI-Generated Feedback</Typography>
            <Typography variant="body2">Progress review, learning gaps, and future focus areas.</Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Profile;
