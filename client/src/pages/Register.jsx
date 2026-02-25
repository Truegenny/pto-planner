import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ color: 'primary.main' }}>
            Create Account
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Start planning your 2026 time off
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Username" value={username}
              onChange={e => setUsername(e.target.value)}
              margin="normal" required autoFocus
            />
            <TextField
              fullWidth label="Email" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              margin="normal" required
            />
            <TextField
              fullWidth label="Password" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              margin="normal" required
              helperText="At least 6 characters"
            />
            <Button
              fullWidth type="submit" variant="contained" size="large"
              disabled={loading} sx={{ mt: 2, mb: 2 }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
