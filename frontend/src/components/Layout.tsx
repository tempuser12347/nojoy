import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, Container, IconButton, Tooltip } from '@mui/material';
import Navigation from './Navigation';
import GitHubIcon from '@mui/icons-material/GitHub';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/tempuser12347/nojoy/releases/latest');
        const data = await response.json();
        const latestVersion = data.tag_name;
        const currentVersion = import.meta.env.VITE_APP_VERSION;

        if (latestVersion !== currentVersion) {
          setNewVersionAvailable(true);
        }
      } catch (error) {
        console.error('Error checking for new version:', error);
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 24 * 60 * 60 * 1000); // Check every 24 hours

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ mr: 4 }}>
            DHO Database
          </Typography>
          <Navigation />
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={newVersionAvailable ? "새로운 버전이 있습니다." : "최신 버전입니다."}>
            <IconButton
              color="inherit"
              href={newVersionAvailable ? "https://github.com/tempuser12347/nojoy/releases/latest" : null}
              target="_blank"
              rel="noopener noreferrer"
              disabled={newVersionAvailable}
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
              {newVersionAvailable ? <NewReleasesIcon /> : <CheckCircleIcon />}
            </IconButton>
          </Tooltip>
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
      <Container component="main" sx={{ mt: 8, mb: 4, flex: 1, width: '100%', maxWidth: '100vw', overflowX: 'auto' }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;