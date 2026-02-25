import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';

export default function PtoSuggestionCard({ suggestion, onAddToCalendar, onCreatePlan }) {
  const efficiencyColor = suggestion.efficiency >= 3 ? '#4CAF50'
    : suggestion.efficiency >= 2 ? '#FF9800'
    : '#2196F3';

  const startDate = new Date(suggestion.start_date + 'T12:00:00');
  const endDate = new Date(suggestion.end_date + 'T12:00:00');
  const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem' }}>
            {dateRange}
          </Typography>
          <Chip
            icon={<StarIcon sx={{ fontSize: 16 }} />}
            label={`${suggestion.efficiency}x`}
            size="small"
            sx={{ bgcolor: efficiencyColor + '22', color: efficiencyColor, fontWeight: 700 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip label={`${suggestion.total_days_off} days off`} size="small" variant="outlined" />
          <Chip label={`${suggestion.pto_days_required} PTO`} size="small" color="primary" variant="outlined" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Holidays leveraged:
        </Typography>
        {suggestion.holidays_leveraged.map((h, i) => (
          <Typography key={i} variant="body2" sx={{ ml: 1 }}>
            {h.name} ({h.date})
          </Typography>
        ))}
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button size="small" variant="contained" onClick={() => onAddToCalendar(suggestion)}>
          Add to Calendar
        </Button>
        <Button size="small" variant="outlined" onClick={() => onCreatePlan(suggestion)}>
          Save as Plan
        </Button>
      </CardActions>
    </Card>
  );
}
