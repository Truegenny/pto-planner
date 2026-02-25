import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import { useEvents } from '../hooks/useEvents';
import YearCalendar from '../components/calendar/YearCalendar';
import MonthCalendar from '../components/calendar/MonthCalendar';
import WeekCalendar from '../components/calendar/WeekCalendar';
import EventDialog from '../components/events/EventDialog';

export default function CalendarPage() {
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  const [view, setView] = useState('year');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const year = 2026;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleEventClick = (event) => {
    setEditingEvent(event);
    setSelectedDate(null);
    setDialogOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, formData);
    } else {
      await createEvent(formData);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id) => {
    await deleteEvent(id);
    setDialogOpen(false);
  };

  const navMonth = (dir) => {
    setCurrentMonth(prev => Math.max(0, Math.min(11, prev + dir)));
  };

  const navWeek = (dir) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + dir * 7);
    if (d.getFullYear() === 2026) {
      setCurrentWeekStart(d.toISOString().slice(0, 10));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Calendar 2026</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {view === 'month' && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => navMonth(-1)}><ChevronLeftIcon /></IconButton>
              <Typography sx={{ minWidth: 120, textAlign: 'center' }}>{monthNames[currentMonth]}</Typography>
              <IconButton onClick={() => navMonth(1)}><ChevronRightIcon /></IconButton>
            </Box>
          )}
          {view === 'week' && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => navWeek(-1)}><ChevronLeftIcon /></IconButton>
              <Typography sx={{ minWidth: 200, textAlign: 'center' }}>
                Week of {new Date(currentWeekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Typography>
              <IconButton onClick={() => navWeek(1)}><ChevronRightIcon /></IconButton>
            </Box>
          )}
          <ToggleButtonGroup value={view} exclusive onChange={(e, v) => v && setView(v)} size="small">
            <ToggleButton value="year">Year</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {view === 'year' && (
        <YearCalendar year={year} events={events} onDayClick={handleDayClick} onEventClick={handleEventClick} />
      )}
      {view === 'month' && (
        <MonthCalendar year={year} month={currentMonth} events={events} onDayClick={handleDayClick} onEventClick={handleEventClick} />
      )}
      {view === 'week' && (
        <WeekCalendar weekStart={new Date(currentWeekStart)} events={events} onDayClick={handleDayClick} onEventClick={handleEventClick} />
      )}

      <Fab
        color="primary"
        onClick={() => { setEditingEvent(null); setSelectedDate(new Date().toISOString().slice(0, 10)); setDialogOpen(true); }}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>

      <EventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        event={editingEvent}
        defaultDate={selectedDate}
      />
    </Box>
  );
}
