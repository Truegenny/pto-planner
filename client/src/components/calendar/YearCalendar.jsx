import Grid from '@mui/material/Grid';
import MonthCalendar from './MonthCalendar';

export default function YearCalendar({ year, events, onDayClick, onEventClick }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: 12 }, (_, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
          <MonthCalendar
            year={year}
            month={i}
            events={events}
            onDayClick={onDayClick}
            onEventClick={onEventClick}
            compact
          />
        </Grid>
      ))}
    </Grid>
  );
}
