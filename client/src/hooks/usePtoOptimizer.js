import { useState, useCallback } from 'react';
import api from '../api';

export function usePtoOptimizer() {
  const [suggestions, setSuggestions] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/optimizer/suggestions');
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHolidays = useCallback(async () => {
    try {
      const { data } = await api.get('/optimizer/holidays');
      setHolidays(data.holidays);
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
    }
  }, []);

  const analyzeDateRange = useCallback(async (start_date, end_date) => {
    const { data } = await api.post('/optimizer/analyze', { start_date, end_date });
    return data.analysis;
  }, []);

  return { suggestions, holidays, loading, fetchSuggestions, fetchHolidays, analyzeDateRange };
}
