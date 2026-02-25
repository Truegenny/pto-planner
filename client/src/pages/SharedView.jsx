import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import axios from 'axios';

export default function SharedView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');

  const fetchShared = async (pwd) => {
    setLoading(true);
    setError('');
    try {
      const params = pwd ? { password: pwd } : {};
      const res = await axios.get(`/api/share/shared/${token}`, { params });
      setData(res.data);
      setNeedsPassword(false);
    } catch (err) {
      if (err.response?.data?.requires_password) {
        setNeedsPassword(true);
      } else {
        setError(err.response?.data?.error || 'Failed to load shared content');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShared(); }, [token]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (needsPassword) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>Password Protected</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This shared content requires a password.
            </Typography>
            <TextField
              fullWidth label="Password" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchShared(password)}
            />
            <Button variant="contained" onClick={() => fetchShared(password)} sx={{ mt: 2 }} fullWidth>
              View Content
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const typeColors = { pto: '#2196F3', holiday: '#F44336', trip: '#4CAF50', general: '#9E9E9E' };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>PTO Planner</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Shared by {data?.owner}
        </Typography>

        {data?.type === 'calendar' && (
          <>
            <Typography variant="h5" gutterBottom>Calendar Events</Typography>
            <Grid container spacing={2}>
              {data.events?.map((event, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: event.color || typeColors[event.event_type] }} />
                        <Typography variant="subtitle1" fontWeight={500}>{event.title}</Typography>
                      </Box>
                      <Chip label={event.event_type} size="small" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.start_date} - {event.end_date}
                      </Typography>
                      {event.destination_state && (
                        <Typography variant="body2" color="text.secondary">
                          Destination: {event.destination_state}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {data?.type === 'plan' && data.plan && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>{data.plan.name}</Typography>
              <Typography variant="body1">
                {data.plan.start_date} to {data.plan.end_date}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Chip label={`${data.plan.total_days_off} days off`} />
                <Chip label={`${data.plan.pto_days_required} PTO days`} color="primary" />
              </Box>
              {data.plan.holidays_leveraged?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Holidays Leveraged:</Typography>
                  {data.plan.holidays_leveraged.map((h, i) => (
                    <Typography key={i} variant="body2">- {h.name} ({h.date})</Typography>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {data?.type === 'event' && data.event && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>{data.event.title}</Typography>
              <Chip label={data.event.event_type} sx={{ mb: 1 }} />
              <Typography variant="body1">{data.event.start_date} to {data.event.end_date}</Typography>
              {data.event.destination_state && (
                <Typography variant="body2">Destination: {data.event.destination_state}</Typography>
              )}
              {data.event.notes && (
                <Typography variant="body2" sx={{ mt: 1 }}>{data.event.notes}</Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
