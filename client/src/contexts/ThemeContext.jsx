import { createContext, useState, useMemo, useEffect, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '../theme';
import { AuthContext } from './AuthContext';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const auth = useContext(AuthContext);
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (auth?.user?.theme) {
      setMode(auth.user.theme);
    }
  }, [auth?.user?.theme]);

  const toggleTheme = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
