import { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

export default function TopBar({ drawerWidth, onMenuToggle }) {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          2026
        </Typography>
        {user && (
          <Chip label={user.username} size="small" sx={{ mr: 1 }} />
        )}
        <IconButton onClick={toggleTheme} size="small" sx={{ mr: 1 }}>
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <IconButton onClick={logout} size="small" color="error">
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
