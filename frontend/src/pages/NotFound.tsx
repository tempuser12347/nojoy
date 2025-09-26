import { Box, Typography } from '@mui/material';

const NotFound = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
    >
      <Typography variant="h2" component="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        페이지를 찾을 수 없습니다
      </Typography>
      <Typography variant="body1" color="text.secondary">
        요청하신 페이지가 존재하지 않거나 아직 구현되지 않았을 수 있습니다.
      </Typography>
    </Box>
  );
};

export default NotFound;