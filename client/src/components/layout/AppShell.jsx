import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DRAWER_WIDTH = 240;

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar drawerWidth={DRAWER_WIDTH} onMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: `${DRAWER_WIDTH}px` },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
