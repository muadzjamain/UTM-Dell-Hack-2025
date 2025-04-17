import React from 'react';
import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';

const Support = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Help & Support
      </Typography>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">FAQ</Typography>
            <Typography variant="body2">Common onboarding queries answered by AI.</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>Ask AI</Button>
          </CardContent>
        </Card>
      </Box>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Live Chat</Typography>
            <Typography variant="body2">Connect with HR or the AI Assistant.</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>Start Chat</Button>
          </CardContent>
        </Card>
      </Box>
      <Box my={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Document Upload</Typography>
            <Typography variant="body2">Submit files for certifications or HR use.</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>Upload Document</Button>
          </CardContent>
        </Card>
      </Box>
      <Box my={3} textAlign="center">
        <Button variant="contained" color="primary">Go to Knowledge Base</Button>
      </Box>
    </Container>
  );
};

export default Support;
