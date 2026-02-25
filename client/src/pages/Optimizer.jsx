import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useEvents } from '../hooks/useEvents';
import { usePtoOptimizer } from '../hooks/usePtoOptimizer';
import PtoBudgetBar from '../components/pto/PtoBudgetBar';
import PtoSuggestionCard from '../components/pto/PtoSuggestionCard';
import api from '../api';

export default function Optimizer() {
  const { ptoSummary, createEvent, fetchEvents } = useEvents();
  const { suggestions, loading, fetchSuggestions } = usePtoOptimizer();

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  const handleAddToCalendar = async (suggestion) => {
    await createEvent({
      title: `PTO: ${suggestion.holiday_cluster}`,
      event_type: 'pto',
      start_date: suggestion.start_date,
      end_date: suggestion.end_date,
      pto_days_used: suggestion.pto_days_required,
      notes: `${suggestion.total_days_off} days off using ${suggestion.pto_days_required} PTO days (${suggestion.efficiency}x efficiency)`,
    });
    fetchSuggestions();
  };

  const handleCreatePlan = async (suggestion) => {
    await api.post('/plans', {
      name: `${suggestion.holiday_cluster} Break`,
      start_date: suggestion.start_date,
      end_date: suggestion.end_date,
      pto_days_required: suggestion.pto_days_required,
      total_days_off: suggestion.total_days_off,
      holidays_leveraged: suggestion.holidays_leveraged,
      suggested_by: 'optimizer',
    });
    alert('Plan saved as draft!');
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>PTO Optimizer</Typography>

      <PtoBudgetBar total={ptoSummary.total} used={ptoSummary.used} remaining={ptoSummary.remaining} />

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        These suggestions show the most efficient ways to use your PTO days in 2026 by leveraging holidays and weekends.
        Higher efficiency means more days off per PTO day used.
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : suggestions.length === 0 ? (
        <Alert severity="info">
          No suggestions available. Configure your work schedule and state in Settings first.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {suggestions.map((suggestion, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <PtoSuggestionCard
                suggestion={suggestion}
                onAddToCalendar={handleAddToCalendar}
                onCreatePlan={handleCreatePlan}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
