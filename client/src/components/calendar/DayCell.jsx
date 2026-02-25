import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { holidayMap } from '../../data/holidays2026';
import EventChip from './EventChip';

export default function DayCell({ date, events = [], isToday, isWeekend, onClick, onEventClick }) {
  if (!date) return <Box sx={{ p: 0.5, minHeight: 80 }} />;

  const dateStr = date.toISOString().slice(0, 10);
  const holiday = holidayMap[dateStr];
  const dayEvents = events.filter(e => e.start_date <= dateStr && e.end_date >= dateStr);
  const day = date.getDate();

  return (
    <Box
      onClick={() => onClick?.(dateStr)}
      sx={{
        p: 0.5,
        minHeight: 80,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        bgcolor: isToday ? 'primary.main' : holiday ? 'error.main' : isWeekend ? 'action.hover' : 'background.paper',
        opacity: isToday || holiday ? 0.9 : 1,
        '&:hover': { bgcolor: 'action.selected' },
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="caption"
        fontWeight={isToday ? 700 : 500}
        sx={{ color: (isToday || holiday) ? 'white' : isWeekend ? 'text.secondary' : 'text.primary' }}
      >
        {day}
      </Typography>
      {holiday && (
        <Typography variant="caption" display="block" sx={{ color: 'white', fontSize: '0.6rem', lineHeight: 1.2 }}>
          {holiday}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.25 }}>
        {dayEvents.slice(0, 2).map(event => (
          <EventChip
            key={event.id}
            event={event}
            onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
          />
        ))}
        {dayEvents.length > 2 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            +{dayEvents.length - 2} more
          </Typography>
        )}
      </Box>
    </Box>
  );
}
