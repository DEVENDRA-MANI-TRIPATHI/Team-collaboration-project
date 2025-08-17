import { Link, Outlet, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useAuth from './hooks/useAuth';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
          <Button component={Link} to="/" variant="text">Dashboard</Button>
          <Box sx={{ flex: 1 }} />
          {user ? (
            <>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {user.username || user.email}
              </Typography>
              <Button onClick={onLogout} variant="outlined" size="small">Logout</Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" variant="outlined" size="small">Login</Button>
              <Button component={Link} to="/signup" variant="contained" size="small">Signup</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
