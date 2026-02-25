import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

export default function PtoBudgetBar({ total, used, remaining }) {
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" fontWeight={500}>
          PTO Budget: {used} / {total} days used
        </Typography>
        <Typography variant="body2" fontWeight={700} color="primary">
          {remaining} days remaining
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 12,
          borderRadius: 6,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: 6,
            bgcolor: percent > 80 ? 'error.main' : percent > 50 ? 'warning.main' : 'primary.main',
          },
        }}
      />
    </Box>
  );
}
