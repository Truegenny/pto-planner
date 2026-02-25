const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { stmts } = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  try {
    const plans = stmts.getPlansByUser.all(req.userId);
    res.json({ plans: plans.map(parsePlan) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const plan = stmts.getPlanById.get(req.params.id, req.userId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ plan: parsePlan(plan) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, start_date, end_date, pto_days_required, total_days_off, holidays_leveraged, suggested_by } = req.body;
    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Name, start_date, and end_date are required' });
    }
    const id = uuidv4();
    stmts.createPlan.run(
      id, req.userId, name, start_date, end_date,
      pto_days_required || 0, total_days_off || 0,
      JSON.stringify(holidays_leveraged || []),
      'draft', suggested_by || 'user'
    );
    const plan = stmts.getPlanById.get(id, req.userId);
    res.status(201).json({ plan: parsePlan(plan) });
  } catch (err) {
    console.error('Create plan error:', err);
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const existing = stmts.getPlanById.get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Plan not found' });
    const { name, start_date, end_date, pto_days_required, total_days_off, holidays_leveraged } = req.body;
    stmts.updatePlan.run(
      name || existing.name, start_date || existing.start_date,
      end_date || existing.end_date,
      pto_days_required ?? existing.pto_days_required,
      total_days_off ?? existing.total_days_off,
      holidays_leveraged ? JSON.stringify(holidays_leveraged) : existing.holidays_leveraged,
      existing.status, req.params.id, req.userId
    );
    const plan = stmts.getPlanById.get(req.params.id, req.userId);
    res.json({ plan: parsePlan(plan) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

router.post('/:id/confirm', (req, res) => {
  try {
    const plan = stmts.getPlanById.get(req.params.id, req.userId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    if (plan.status === 'confirmed') return res.status(400).json({ error: 'Plan already confirmed' });

    stmts.confirmPlan.run(req.params.id, req.userId);

    // Create PTO events for workdays in the plan range
    const eventId = uuidv4();
    stmts.createEvent.run(
      eventId, req.userId, `PTO: ${plan.name}`, `Auto-created from plan: ${plan.name}`,
      'pto', plan.start_date, plan.end_date, '#2196F3',
      null, plan.pto_days_required, null
    );

    const updated = stmts.getPlanById.get(req.params.id, req.userId);
    res.json({ plan: parsePlan(updated), event_id: eventId });
  } catch (err) {
    console.error('Confirm plan error:', err);
    res.status(500).json({ error: 'Failed to confirm plan' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = stmts.deletePlan.run(req.params.id, req.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

function parsePlan(plan) {
  return {
    ...plan,
    holidays_leveraged: typeof plan.holidays_leveraged === 'string' ? JSON.parse(plan.holidays_leveraged) : plan.holidays_leveraged
  };
}

module.exports = router;
