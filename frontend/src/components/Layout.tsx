import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container, IconButton } from '@mui/material';
import Navigation from './Navigation';
import GitHubIcon from '@mui/icons-material/GitHub';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ mr: 4 }}>
            DHO Database
          </Typography>
          <Navigation />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            color="inherit"
            href="https://github.com/tempuser12347/nojoy"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'white',
              opacity: 0.7,
              mr: 1,
              '&:hover': {
                color: 'white',
                opacity: 1,
              },
            }}
          >
            <GitHubIcon />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'white', opacity: 0.7 }}>
            {import.meta.env.VITE_APP_VERSION}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth={false} sx={{ mt: 8, mb: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;