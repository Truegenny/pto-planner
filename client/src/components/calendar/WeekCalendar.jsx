import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { holidayMap } from '../../data/holidays2026';
import EventChip from './EventChip';

const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeekCalendar({ weekStart, events, onDayClick, onEventClick }) {
  const today = new Date().toISOString().slice(0, 10);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {days.map((date, i) => {
        const dateStr = date.toISOString().slice(0, 10);
        const holiday = holidayMap[dateStr];
        const dayEvents = events.filter(e => e.start_date <= dateStr && e.end_date >= dateStr);
        const isToday = dateStr === today;

        return (
          <Paper
            key={i}
            onClick={() => onDayClick?.(dateStr)}
            sx={{
              flex: 1,
              p: 1.5,
              minHeight: 200,
              cursor: 'pointer',
              border: isToday ? 2 : 0,
              borderColor: 'primary.main',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Typography variant="caption" color="text.secondary">{DOW[i]}</Typography>
            <Typography variant="h6" fontWeight={isToday ? 700 : 400}>
              {date.getDate()}
            </Typography>
            {holiday && (
              <Typography variant="caption" color="error" display="block">{holiday}</Typography>
            )}
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {dayEvents.map(event => (
                <EventChip
                  key={event.id}
                  event={event}
                  onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
                />
              ))}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
