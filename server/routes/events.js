const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { stmts } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', (req, res) => {
  try {
    const { start, end } = req.query;
    let events;
    if (start && end) {
      events = stmts.getEventsByUserAndDateRange.all(req.userId, end, start);
    } else {
      events = stmts.getEventsByUser.all(req.userId);
    }
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/pto-summary', (req, res) => {
  try {
    const user = stmts.getUserById.get(req.userId);
    const { used } = stmts.getPtoSummary.get(req.userId);
    res.json({
      total: user.pto_total_days,
      used: used,
      remaining: user.pto_total_days - used
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get PTO summary' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const event = stmts.getEventById.get(req.params.id, req.userId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

router.post('/', (req, res) => {
  try {
    const { title, description, event_type, start_date, end_date, color, destination_state, pto_days_used, notes } = req.body;
    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'Title, start_date, and end_date are required' });
    }
    const id = uuidv4();
    const defaultColors = { pto: '#2196F3', holiday: '#F44336', trip: '#4CAF50', general: '#9E9E9E' };
    stmts.createEvent.run(
      id, req.userId, title, description || null, event_type || 'general',
      start_date, end_date, color || defaultColors[event_type] || '#9E9E9E',
      destination_state || null, pto_days_used || 0, notes || null
    );
    const event = stmts.getEventById.get(id, req.userId);
    res.status(201).json({ event });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const existing = stmts.getEventById.get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Event not found' });
    const { title, description, event_type, start_date, end_date, color, destination_state, pto_days_used, notes } = req.body;
    stmts.updateEvent.run(
      title || existing.title, description ?? existing.description,
      event_type || existing.event_type, start_date || existing.start_date,
      end_date || existing.end_date, color || existing.color,
      destination_state ?? existing.destination_state,
      pto_days_used ?? existing.pto_days_used, notes ?? existing.notes,
      req.params.id, req.userId
    );
    const event = stmts.getEventById.get(req.params.id, req.userId);
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = stmts.deleteEvent.run(req.params.id, req.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
