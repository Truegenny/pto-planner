import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

export default function StateWeatherCard({ stateCode, stateName, weather, onClick }) {
  if (!weather) return null;

  const tempColor = weather.high >= 85 ? '#F44336'
    : weather.high >= 70 ? '#FF9800'
    : weather.high >= 50 ? '#4CAF50'
    : '#2196F3';

  return (
    <Card onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default', '&:hover': onClick ? { boxShadow: 4 } : {} }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>{stateName}</Typography>
            <Typography variant="caption" color="text.secondary">{stateCode}</Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: tempColor }}>
            {weather.high}°F
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {weather.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip icon={<ThermostatIcon />} label={`${weather.low}° - ${weather.high}°`} size="small" variant="outlined" />
          <Chip icon={<WaterDropIcon />} label={`${weather.precipitation}" rain`} size="small" variant="outlined" />
          <Chip icon={<WbSunnyIcon />} label={`${weather.sunny_days} sunny days`} size="small" variant="outlined" />
        </Box>
      </CardContent>
    </Card>
  );
}
