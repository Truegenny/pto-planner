import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [ptoSummary, setPtoSummary] = useState({ total: 0, used: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const [eventsRes, ptoRes] = await Promise.all([
        api.get('/events'),
        api.get('/events/pto-summary')
      ]);
      setEvents(eventsRes.data.events);
      setPtoSummary(ptoRes.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const createEvent = async (eventData) => {
    const { data } = await api.post('/events', eventData);
    await fetchEvents();
    return data.event;
  };

  const updateEvent = async (id, eventData) => {
    const { data } = await api.put(`/events/${id}`, eventData);
    await fetchEvents();
    return data.event;
  };

  const deleteEvent = async (id) => {
    await api.delete(`/events/${id}`);
    await fetchEvents();
  };

  return { events, ptoSummary, loading, fetchEvents, createEvent, updateEvent, deleteEvent };
}
