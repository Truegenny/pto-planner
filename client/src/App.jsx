import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useContext } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Optimizer from './pages/Optimizer';
import Weather from './pages/Weather';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Sharing from './pages/Sharing';
import SharedView from './pages/SharedView';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  return user ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/shared/:token" element={<SharedView />} />
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/optimizer" element={<Optimizer />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/sharing" element={<Sharing />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
