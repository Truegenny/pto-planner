import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import { stateNames } from '../../data/stateRegions';

const eventTypes = [
  { value: 'pto', label: 'PTO', color: '#2196F3' },
  { value: 'trip', label: 'Trip', color: '#4CAF50' },
  { value: 'general', label: 'General', color: '#9E9E9E' },
];

export default function EventDialog({ open, onClose, onSave, onDelete, event, defaultDate }) {
  const [form, setForm] = useState({
    title: '', description: '', event_type: 'pto',
    start_date: '', end_date: '', destination_state: '',
    pto_days_used: 0, notes: '', color: '#2196F3',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        event_type: event.event_type || 'pto',
        start_date: event.start_date || '',
        end_date: event.end_date || '',
        destination_state: event.destination_state || '',
        pto_days_used: event.pto_days_used || 0,
        notes: event.notes || '',
        color: event.color || '#2196F3',
      });
    } else {
      setForm({
        title: '', description: '', event_type: 'pto',
        start_date: defaultDate || '', end_date: defaultDate || '',
        destination_state: '', pto_days_used: 0, notes: '', color: '#2196F3',
      });
    }
    setError('');
  }, [event, defaultDate, open]);

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'event_type') {
        const colors = { pto: '#2196F3', trip: '#4CAF50', general: '#9E9E9E' };
        next.color = colors[val] || '#9E9E9E';
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!form.title || !form.start_date || !form.end_date) {
      setError('Title, start date, and end date are required');
      return;
    }
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{event ? 'Edit Event' : 'New Event'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField fullWidth label="Title" value={form.title} onChange={handleChange('title')} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Description" value={form.description} onChange={handleChange('description')} multiline rows={2} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Type" value={form.event_type} onChange={handleChange('event_type')}>
              {eventTypes.map(t => (
                <MenuItem key={t.value} value={t.value}>
                  <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: t.color, marginRight: 8 }} />
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="PTO Days Used" type="number" value={form.pto_days_used}
              onChange={handleChange('pto_days_used')}
              inputProps={{ min: 0, step: 0.5 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Start Date" type="date" value={form.start_date}
              onChange={handleChange('start_date')} InputLabelProps={{ shrink: true }} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="End Date" type="date" value={form.end_date}
              onChange={handleChange('end_date')} InputLabelProps={{ shrink: true }} required />
          </Grid>
          {(form.event_type === 'trip') && (
            <Grid item xs={12}>
              <TextField select fullWidth label="Destination State" value={form.destination_state} onChange={handleChange('destination_state')}>
                <MenuItem value="">None</MenuItem>
                {Object.entries(stateNames).map(([code, name]) => (
                  <MenuItem key={code} value={code}>{name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField fullWidth label="Notes" value={form.notes} onChange={handleChange('notes')} multiline rows={2} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {event && onDelete && (
          <Button color="error" onClick={() => onDelete(event.id)} sx={{ mr: 'auto' }}>Delete</Button>
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {event ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
