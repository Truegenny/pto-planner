import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import api from '../../api';

export default function ShareDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    link_type: 'calendar', expires_in_hours: '', password: '', max_views: '',
  });
  const [createdLink, setCreatedLink] = useState(null);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    try {
      const { data } = await api.post('/share/links', {
        link_type: form.link_type,
        expires_in_hours: form.expires_in_hours ? parseInt(form.expires_in_hours) : undefined,
        password: form.password || undefined,
        max_views: form.max_views ? parseInt(form.max_views) : undefined,
      });
      setCreatedLink(data.link);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create link');
    }
  };

  const shareUrl = createdLink ? `${window.location.origin}/shared/${createdLink.id}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  const handleClose = () => {
    setCreatedLink(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Shared Link</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}

        {createdLink ? (
          <>
            <Alert severity="success" sx={{ mb: 2, mt: 1 }}>Link created!</Alert>
            <Typography variant="body2" sx={{ mb: 1 }}>Share this URL:</Typography>
            <TextField
              fullWidth value={shareUrl} size="small"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={copyToClipboard} size="small"><ContentCopyIcon /></IconButton>
                )
              }}
            />
          </>
        ) : (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField select fullWidth label="Share Type" value={form.link_type}
                onChange={e => setForm(p => ({ ...p, link_type: e.target.value }))}>
                <MenuItem value="calendar">Full Calendar</MenuItem>
                <MenuItem value="plan">Specific Plan</MenuItem>
                <MenuItem value="event">Specific Event</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Expires in (hours)" type="number" placeholder="No expiration"
                value={form.expires_in_hours} onChange={e => setForm(p => ({ ...p, expires_in_hours: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Max Views" type="number" placeholder="Unlimited"
                value={form.max_views} onChange={e => setForm(p => ({ ...p, max_views: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Password (optional)" type="password"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        {!createdLink && (
          <Button variant="contained" onClick={handleCreate}>Create Link</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
