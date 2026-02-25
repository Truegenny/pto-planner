import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import { stateNames } from '../data/stateRegions';

const daysOfWeek = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    username: '', email: '', pto_total_days: 15, state: 'CA',
    work_schedule: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
  });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' });
  const [apiKey, setApiKey] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        pto_total_days: user.pto_total_days || 15,
        state: user.state || 'CA',
        work_schedule: user.work_schedule || { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setError(''); setMessage('');
    try {
      const { data } = await api.put('/auth/me', form);
      updateUser(data.user);
      setMessage('Profile updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleSavePtoConfig = async () => {
    setError(''); setMessage('');
    try {
      const { data } = await api.put('/auth/pto-config', {
        pto_total_days: form.pto_total_days,
        work_schedule: form.work_schedule,
        state: form.state,
      });
      updateUser(data.user);
      setMessage('PTO configuration updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update PTO config');
    }
  };

  const handleChangePassword = async () => {
    setError(''); setMessage('');
    try {
      await api.put('/auth/password', passwordForm);
      setPasswordForm({ current_password: '', new_password: '' });
      setMessage('Password updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    }
  };

  const handleSaveApiKey = async () => {
    setError(''); setMessage('');
    try {
      await api.put('/auth/api-key', { api_key: apiKey || null });
      setApiKey('');
      setMessage(apiKey ? 'API key saved' : 'API key removed');
    } catch (err) {
      setError('Failed to update API key');
    }
  };

  const toggleWorkDay = (day) => {
    setForm(prev => ({
      ...prev,
      work_schedule: { ...prev.work_schedule, [day]: !prev.work_schedule[day] }
    }));
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Settings</Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Profile */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Profile</Typography>
              <TextField fullWidth label="Username" value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))} margin="normal" />
              <TextField fullWidth label="Email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} margin="normal" />
              <Button variant="contained" onClick={handleSaveProfile} sx={{ mt: 2 }}>Save Profile</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* PTO Configuration */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>PTO Configuration</Typography>
              <TextField
                fullWidth label="Total PTO Days" type="number" value={form.pto_total_days}
                onChange={e => setForm(p => ({ ...p, pto_total_days: parseInt(e.target.value) || 0 }))}
                margin="normal" inputProps={{ min: 0, max: 365 }}
              />
              <TextField
                select fullWidth label="State" value={form.state}
                onChange={e => setForm(p => ({ ...p, state: e.target.value }))} margin="normal"
              >
                {Object.entries(stateNames).map(([code, name]) => (
                  <MenuItem key={code} value={code}>{name} ({code})</MenuItem>
                ))}
              </TextField>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Work Schedule</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {daysOfWeek.map(d => (
                  <FormControlLabel
                    key={d.key}
                    control={<Checkbox checked={form.work_schedule[d.key]} onChange={() => toggleWorkDay(d.key)} size="small" />}
                    label={d.label}
                  />
                ))}
              </Box>
              <Button variant="contained" onClick={handleSavePtoConfig} sx={{ mt: 2 }}>Save PTO Config</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Password */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Change Password</Typography>
              <TextField fullWidth label="Current Password" type="password"
                value={passwordForm.current_password}
                onChange={e => setPasswordForm(p => ({ ...p, current_password: e.target.value }))} margin="normal" />
              <TextField fullWidth label="New Password" type="password"
                value={passwordForm.new_password}
                onChange={e => setPasswordForm(p => ({ ...p, new_password: e.target.value }))} margin="normal" />
              <Button variant="contained" onClick={handleChangePassword} sx={{ mt: 2 }}>Update Password</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* API Key */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Anthropic API Key</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Required for AI chat. Your key is encrypted at rest.
                {user?.has_api_key && ' A key is currently configured.'}
              </Typography>
              <TextField fullWidth label="API Key" type="password" placeholder="sk-ant-..."
                value={apiKey} onChange={e => setApiKey(e.target.value)} margin="normal" />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button variant="contained" onClick={handleSaveApiKey}>{apiKey ? 'Save Key' : 'Remove Key'}</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
