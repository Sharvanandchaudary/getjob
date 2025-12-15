import React from 'react';
import { Container, Typography } from '@mui/material';

const Applications = () => {
  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Applications Page
      </Typography>
      <Typography variant="body1">
        This page will show all applications in detail.
      </Typography>
    </Container>
  );
};

export default Applications;
