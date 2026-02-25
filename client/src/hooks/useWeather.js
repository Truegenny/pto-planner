import { useState, useCallback } from 'react';
import api from '../api';

export function useWeather() {
  const [states, setStates] = useState([]);
  const [regions, setRegions] = useState({});
  const [stateWeather, setStateWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStates = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/weather/states');
      setStates(data.states);
      setRegions(data.regions);
    } catch (err) {
      console.error('Failed to fetch states:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStateWeather = useCallback(async (stateCode) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/weather/${stateCode}`);
      setStateWeather(data);
    } catch (err) {
      console.error('Failed to fetch state weather:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const compareStates = useCallback(async (stateCodes, month) => {
    try {
      const { data } = await api.get('/weather/compare', {
        params: { states: stateCodes.join(','), month }
      });
      return data.comparison;
    } catch (err) {
      console.error('Failed to compare states:', err);
      return null;
    }
  }, []);

  return { states, regions, stateWeather, loading, fetchStates, fetchStateWeather, compareStates };
}
