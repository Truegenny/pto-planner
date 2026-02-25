import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import DayCell from './DayCell';
import { holidayMap } from '../../data/holidays2026';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthCalendar({ year, month, events, onDayClick, onEventClick, compact = false }) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const today = new Date().toISOString().slice(0, 10);

  const weeks = [];
  let week = new Array(7).fill(null);
  let dayNum = 1;

  for (let i = startDow; dayNum <= daysInMonth; i++) {
    week[i % 7] = new Date(year, month, dayNum);
    dayNum++;
    if (i % 7 === 6 || dayNum > daysInMonth) {
      weeks.push(week);
      week = new Array(7).fill(null);
    }
  }

  const monthName = firstDay.toLocaleDateString('en-US', { month: 'long' });

  return (
    <Box>
      {!compact && (
        <Typography variant="h6" sx={{ mb: 1 }}>{monthName} {year}</Typography>
      )}
      {compact && (
        <Typography variant="subtitle2" align="center" sx={{ mb: 0.5 }}>{monthName}</Typography>
      )}
      <Grid container columns={7}>
        {DOW.map(d => (
          <Grid item xs={1} key={d}>
            <Typography variant="caption" align="center" display="block" fontWeight={600} color="text.secondary">
              {compact ? d[0] : d}
            </Typography>
          </Grid>
        ))}
        {weeks.map((week, wi) =>
          week.map((date, di) => (
            <Grid item xs={1} key={`${wi}-${di}`}>
              {compact ? (
                <CompactDayCell
                  date={date}
                  events={events}
                  isToday={date && date.toISOString().slice(0, 10) === today}
                  onClick={onDayClick}
                />
              ) : (
                <DayCell
                  date={date}
                  events={events}
                  isToday={date && date.toISOString().slice(0, 10) === today}
                  isWeekend={di === 0 || di === 6}
                  onClick={onDayClick}
                  onEventClick={onEventClick}
                />
              )}
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

function CompactDayCell({ date, events, isToday, onClick }) {
  if (!date) return <Box sx={{ p: 0.3, minHeight: 28 }} />;

  const dateStr = date.toISOString().slice(0, 10);
  const holiday = holidayMap[dateStr];
  const hasEvents = events.some(e => e.start_date <= dateStr && e.end_date >= dateStr);
  const day = date.getDate();

  return (
    <Box
      onClick={() => onClick?.(dateStr)}
      sx={{
        p: 0.3,
        minHeight: 28,
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: '50%',
        mx: 'auto',
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isToday ? 'primary.main' : holiday ? 'error.light' : 'transparent',
        color: isToday ? 'white' : holiday ? 'white' : 'text.primary',
        position: 'relative',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography variant="caption" fontSize="0.7rem">{day}</Typography>
      {hasEvents && (
        <Box sx={{
          position: 'absolute', bottom: 1, width: 4, height: 4,
          borderRadius: '50%', bgcolor: 'primary.main'
        }} />
      )}
    </Box>
  );
}
