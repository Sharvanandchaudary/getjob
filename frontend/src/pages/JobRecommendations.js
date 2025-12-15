import React from 'react';
import { Container, Typography } from '@mui/material';

const JobRecommendations = () => {
  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        AI Job Recommendations
      </Typography>
      <Typography variant="body1">
        AI-powered job matches will appear here.
      </Typography>
    </Container>
  );
};

export default JobRecommendations;
