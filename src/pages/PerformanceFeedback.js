import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';

const PerformanceFeedback = () => {
  // Placeholder data; replace with real analytics and AI reports
  const analytics = [
    { label: 'Completion Rate', value: '80%' },
    { label: 'Quiz Scores', value: '90%' },
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
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">{item.label}</Typography>
                  <Typography variant="h5">{item.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">AI-Generated Reports</Typography>
            <Typography variant="body2">Dynamic insights into task completion, strengths, and improvement areas.</Typography>
          </CardContent>
        </Card>
      </Box>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Goal Completion Summary</Typography>
            <Typography variant="body2">Shows milestones and recommends new goals.</Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default PerformanceFeedback;
