import { createTheme } from '@mui/material/styles';

export function getTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#2196F3' },
      secondary: { main: '#FF9800' },
      ...(mode === 'dark' ? {
        background: { default: '#121212', paper: '#1e1e1e' },
      } : {
        background: { default: '#f5f5f5', paper: '#ffffff' },
      }),
      pto: { main: '#2196F3', light: '#64B5F6' },
      holiday: { main: '#F44336', light: '#EF9A9A' },
      trip: { main: '#4CAF50', light: '#A5D6A7' },
      general: { main: '#9E9E9E', light: '#E0E0E0' },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 500 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
    },
  });
}
