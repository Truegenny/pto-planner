import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MonthSelector from '../components/weather/MonthSelector';
import StateWeatherCard from '../components/weather/StateWeatherCard';
import WeatherMap from '../components/weather/WeatherMap';
import api from '../api';
import { stateNames, regions, monthNames } from '../data/stateRegions';

export default function WeatherPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [regionFilter, setRegionFilter] = useState('All');
  const [allWeather, setAllWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);
  const [stateDetail, setStateDetail] = useState(null);

  useEffect(() => {
    loadAllWeather();
  }, []);

  const loadAllWeather = async () => {
    setLoading(true);
    try {
      // Fetch all states data by loading each state
      const statesRes = await api.get('/weather/states');
      const weatherMap = {};
      // Load a few key states to build the map, or load full data
      const codes = statesRes.data.states.map(s => s.code);
      const promises = codes.map(code => api.get(`/weather/${code}`).then(r => ({ code, data: r.data })));
      const results = await Promise.all(promises);
      results.forEach(({ code, data }) => {
        weatherMap[code] = data;
      });
      setAllWeather(weatherMap);
    } catch (err) {
      console.error('Failed to load weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateClick = async (code) => {
    try {
      const { data } = await api.get(`/weather/${code}`);
      setStateDetail(data);
      setSelectedState(code);
    } catch (err) {
      console.error('Failed to load state detail:', err);
    }
  };

  const filteredStates = Object.keys(stateNames).filter(code => {
    if (regionFilter === 'All') return true;
    return regions[regionFilter]?.includes(code);
  });

  if (loading) {
    return <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Weather Explorer</Typography>

      <MonthSelector value={month} onChange={setMonth} />

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>{monthNames[month - 1]} Average Temperatures</Typography>

      <WeatherMap weatherData={allWeather} month={month} onStateClick={handleStateClick} />

      <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 2, alignItems: 'center' }}>
        <Typography variant="h6">State Details</Typography>
        <TextField
          select size="small" value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="All">All Regions</MenuItem>
          {Object.keys(regions).map(r => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Grid container spacing={2}>
        {filteredStates.map(code => {
          const weather = allWeather?.[code]?.months?.[String(month)];
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={code}>
              <StateWeatherCard
                stateCode={code}
                stateName={stateNames[code]}
                weather={weather}
                onClick={() => handleStateClick(code)}
              />
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={!!selectedState} onClose={() => setSelectedState(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          {stateDetail?.name} ({selectedState}) - Year-Round Weather
          <IconButton onClick={() => setSelectedState(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {stateDetail && (
            <Grid container spacing={2}>
              {monthNames.map((name, i) => {
                const w = stateDetail.months?.[String(i + 1)];
                if (!w) return null;
                return (
                  <Grid item xs={6} sm={4} md={3} key={i}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Typography variant="subtitle2">{name}</Typography>
                      <Typography variant="h6" color="primary">{w.high}°F</Typography>
                      <Typography variant="caption" display="block">Low: {w.low}°F</Typography>
                      <Typography variant="caption" display="block">Rain: {w.precipitation}"</Typography>
                      <Typography variant="caption" display="block">Sunny: {w.sunny_days} days</Typography>
                      <Typography variant="caption" color="text.secondary">{w.description}</Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
