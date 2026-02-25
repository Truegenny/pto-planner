const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

let weatherData = null;
function getWeatherData() {
  if (!weatherData) {
    const filePath = path.join(__dirname, '..', 'data', 'weatherAverages.json');
    weatherData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return weatherData;
}

router.get('/states', (req, res) => {
  try {
    const data = getWeatherData();
    const states = Object.entries(data.states).map(([code, info]) => ({
      code,
      name: info.name,
      region: info.region
    }));
    res.json({ states, regions: data.regions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load weather data' });
  }
});

router.get('/compare', (req, res) => {
  try {
    const { states: stateCodes, month } = req.query;
    if (!stateCodes || !month) {
      return res.status(400).json({ error: 'states and month query params required' });
    }
    const data = getWeatherData();
    const codes = stateCodes.split(',');
    const comparison = {};
    for (const code of codes) {
      const stateData = data.states[code.trim().toUpperCase()];
      if (stateData) {
        comparison[code.trim().toUpperCase()] = {
          name: stateData.name,
          region: stateData.region,
          weather: stateData.months[String(parseInt(month))]
        };
      }
    }
    res.json({ comparison, month: parseInt(month) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compare weather data' });
  }
});

router.get('/:stateCode', (req, res) => {
  try {
    const data = getWeatherData();
    const stateData = data.states[req.params.stateCode.toUpperCase()];
    if (!stateData) {
      return res.status(404).json({ error: 'State not found' });
    }
    res.json({ state: req.params.stateCode.toUpperCase(), ...stateData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load state weather data' });
  }
});

router.get('/:stateCode/:month', (req, res) => {
  try {
    const data = getWeatherData();
    const stateData = data.states[req.params.stateCode.toUpperCase()];
    if (!stateData) {
      return res.status(404).json({ error: 'State not found' });
    }
    const monthData = stateData.months[String(parseInt(req.params.month))];
    if (!monthData) {
      return res.status(404).json({ error: 'Invalid month' });
    }
    res.json({
      state: req.params.stateCode.toUpperCase(),
      name: stateData.name,
      month: parseInt(req.params.month),
      weather: monthData
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load weather data' });
  }
});

module.exports = router;
