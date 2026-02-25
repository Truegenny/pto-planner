import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ChatIcon from '@mui/icons-material/Chat';
import EventIcon from '@mui/icons-material/Event';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';
import { federalHolidays } from '../data/holidays2026';

export default function Dashboard() {
  const { events, ptoSummary, loading } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();

  const upcomingEvents = events
    .filter(e => e.start_date >= new Date().toISOString().slice(0, 10))
    .slice(0, 5);

  const upcomingHolidays = federalHolidays
    .filter(h => h.date >= new Date().toISOString().slice(0, 10))
    .slice(0, 3);

  const ptoPercent = ptoSummary.total > 0
    ? Math.round((ptoSummary.used / ptoSummary.total) * 100)
    : 0;

  const typeColors = { pto: '#2196F3', holiday: '#F44336', trip: '#4CAF50', general: '#9E9E9E' };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Welcome, {user?.username}
      </Typography>

      <Grid container spacing={3}>
        {/* PTO Budget Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BeachAccessIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                PTO Budget
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {ptoSummary.used} of {ptoSummary.total} days used
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {ptoSummary.remaining} remaining
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={ptoPercent}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="h3" align="center" sx={{ color: 'primary.main', mt: 2 }}>
                {ptoSummary.remaining}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                days remaining in 2026
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <EventIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'secondary.main' }} />
                Upcoming Events
              </Typography>
              {upcomingEvents.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No upcoming events. Start planning!
                </Typography>
              ) : (
                upcomingEvents.map(event => (
                  <Box key={event.id} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ width: 4, height: 32, bgcolor: typeColors[event.event_type] || '#9E9E9E', borderRadius: 1, mr: 1.5 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={500}>{event.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.start_date}{event.start_date !== event.end_date ? ` - ${event.end_date}` : ''}
                      </Typography>
                    </Box>
                    <Chip label={event.event_type} size="small" sx={{ bgcolor: typeColors[event.event_type] + '22', color: typeColors[event.event_type] }} />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Holidays */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <WbSunnyIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#F44336' }} />
                Next Holidays
              </Typography>
              {upcomingHolidays.map(h => (
                <Box key={h.date} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ width: 4, height: 32, bgcolor: '#F44336', borderRadius: 1, mr: 1.5 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{h.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{h.date}</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={6} sm={3}>
          <Card>
            <CardActionArea onClick={() => navigate('/calendar')} sx={{ p: 3, textAlign: 'center' }}>
              <CalendarMonthIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body1" fontWeight={500}>Calendar</Typography>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardActionArea onClick={() => navigate('/optimizer')} sx={{ p: 3, textAlign: 'center' }}>
              <AutoAwesomeIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="body1" fontWeight={500}>Optimizer</Typography>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardActionArea onClick={() => navigate('/weather')} sx={{ p: 3, textAlign: 'center' }}>
              <WbSunnyIcon sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="body1" fontWeight={500}>Weather</Typography>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardActionArea onClick={() => navigate('/chat')} sx={{ p: 3, textAlign: 'center' }}>
              <ChatIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="body1" fontWeight={500}>AI Chat</Typography>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
