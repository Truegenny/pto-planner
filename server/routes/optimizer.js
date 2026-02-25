const express = require('express');
const { stmts } = require('../db');
const { auth } = require('../middleware/auth');
const { generateSuggestions, analyzeDateRange } = require('../utils/ptoOptimizer');
const { getAllHolidaysForState, getFederalHolidays } = require('../utils/holidayEngine');

const router = express.Router();
router.use(auth);

router.get('/suggestions', (req, res) => {
  try {
    const user = stmts.getUserById.get(req.userId);
    const events = stmts.getEventsByUser.all(req.userId);
    const suggestions = generateSuggestions(user.work_schedule, user.state, events);
    res.json({ suggestions });
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

router.get('/holidays', (req, res) => {
  try {
    const user = stmts.getUserById.get(req.userId);
    const holidays = getAllHolidaysForState(user.state);
    const federal = getFederalHolidays();
    res.json({ holidays, federal, state: user.state });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get holidays' });
  }
});

router.post('/analyze', (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date required' });
    }
    const user = stmts.getUserById.get(req.userId);
    const analysis = analyzeDateRange(start_date, end_date, user.work_schedule, user.state);
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze date range' });
  }
});

module.exports = router;
