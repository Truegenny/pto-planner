import { useLocation, useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
  { text: 'PTO Optimizer', icon: <AutoAwesomeIcon />, path: '/optimizer' },
  { text: 'Weather', icon: <WbSunnyIcon />, path: '/weather' },
  { text: 'AI Chat', icon: <ChatIcon />, path: '/chat' },
  { text: 'Sharing', icon: <ShareIcon />, path: '/sharing' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Sidebar({ drawerWidth, mobileOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const content = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: 'primary.main' }}>
          PTO Planner
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); onClose(); }}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {content}
      </Drawer>
    </Box>
  );
}
