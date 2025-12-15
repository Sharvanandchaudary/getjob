import React from 'react';
import { Container, Typography } from '@mui/material';

const Settings = () => {
  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Settings
      </Typography>
      <Typography variant="body1">
        User settings and preferences.
      </Typography>
    </Container>
  );
};

export default Settings;
