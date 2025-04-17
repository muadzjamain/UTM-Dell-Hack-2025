import React from 'react';
import { Container, Typography, Box, Button, Card, CardContent } from '@mui/material';

const CultureCompliance = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Company Culture & Compliance
      </Typography>
      <Typography variant="body1" gutterBottom>
        Learn about our values, ethics, and compliance requirements.
      </Typography>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">AI Conversations</Typography>
            <Typography variant="body2">Guided Q&A for cultural understanding.</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>Start Q&A</Button>
          </CardContent>
        </Card>
      </Box>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Compliance Quiz</Typography>
            <Typography variant="body2">AI-generated assessments for retention and understanding.</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>Start Quiz</Button>
          </CardContent>
        </Card>
      </Box>
      <Box my={3} textAlign="center">
        <Button variant="contained" color="success">Complete Task</Button>
      </Box>
    </Container>
  );
};

export default CultureCompliance;
