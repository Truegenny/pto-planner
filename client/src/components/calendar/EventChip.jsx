import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

const typeColors = {
  pto: '#2196F3',
  holiday: '#F44336',
  trip: '#4CAF50',
  general: '#9E9E9E',
};

export default function EventChip({ event, onClick, size = 'small' }) {
  return (
    <Tooltip title={`${event.title} (${event.event_type})`} arrow>
      <Chip
        label={event.title}
        size={size}
        onClick={onClick}
        sx={{
          bgcolor: event.color || typeColors[event.event_type] || '#9E9E9E',
          color: 'white',
          maxWidth: '100%',
          height: 20,
          fontSize: '0.7rem',
          cursor: 'pointer',
          '& .MuiChip-label': { px: 0.5 },
        }}
      />
    </Tooltip>
  );
}
