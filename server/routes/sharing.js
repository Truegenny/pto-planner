const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { stmts } = require('../db');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Create shared link
router.post('/links', auth, (req, res) => {
  try {
    const { link_type, target_id, expires_in_hours, password, max_views } = req.body;
    const id = uuidv4();
    const expiresAt = expires_in_hours
      ? new Date(Date.now() + expires_in_hours * 3600000).toISOString()
      : null;
    const passwordHash = password ? bcrypt.hashSync(password, 10) : null;

    stmts.createSharedLink.run(
      id, req.userId, link_type || 'calendar',
      target_id || null, expiresAt, passwordHash, max_views || null
    );

    const link = stmts.getSharedLinkById.get(id);
    res.status(201).json({
      link: {
        ...link,
        url: `/shared/${id}`,
        has_password: !!passwordHash
      }
    });
  } catch (err) {
    console.error('Create share link error:', err);
    res.status(500).json({ error: 'Failed to create shared link' });
  }
});

// List user's shared links
router.get('/links', auth, (req, res) => {
  try {
    const links = stmts.getSharedLinksByUser.all(req.userId);
    res.json({
      links: links.map(l => ({
        ...l,
        url: `/shared/${l.id}`,
        has_password: !!l.password_hash
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// Deactivate shared link
router.delete('/links/:id', auth, (req, res) => {
  try {
    stmts.deactivateSharedLink.run(req.params.id, req.userId);
    res.json({ message: 'Link deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate link' });
  }
});

// Access shared content (public)
router.get('/shared/:token', (req, res) => {
  try {
    const link = stmts.getSharedLinkById.get(req.params.token);
    if (!link || !link.is_active) {
      return res.status(404).json({ error: 'Shared link not found or inactive' });
    }

    // Check expiration
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    // Check max views
    if (link.max_views && link.view_count >= link.max_views) {
      return res.status(410).json({ error: 'This link has reached its view limit' });
    }

    // Check password
    if (link.password_hash) {
      const password = req.query.password || req.headers['x-share-password'];
      if (!password || !bcrypt.compareSync(password, link.password_hash)) {
        return res.status(401).json({ error: 'Password required', requires_password: true });
      }
    }

    // Increment view count
    stmts.incrementViewCount.run(link.id);

    // Fetch shared data
    const user = stmts.getUserById.get(link.user_id);
    let data = {};

    if (link.link_type === 'calendar') {
      const events = stmts.getEventsByUser.all(link.user_id);
      data = {
        type: 'calendar',
        owner: user.username,
        events: events.map(e => ({
          title: e.title,
          event_type: e.event_type,
          start_date: e.start_date,
          end_date: e.end_date,
          color: e.color,
          destination_state: e.destination_state
        }))
      };
    } else if (link.link_type === 'plan' && link.target_id) {
      const plan = stmts.getPlanById.get(link.target_id, link.user_id);
      if (plan) {
        data = {
          type: 'plan',
          owner: user.username,
          plan: {
            name: plan.name,
            start_date: plan.start_date,
            end_date: plan.end_date,
            total_days_off: plan.total_days_off,
            pto_days_required: plan.pto_days_required,
            holidays_leveraged: JSON.parse(plan.holidays_leveraged)
          }
        };
      }
    } else if (link.link_type === 'event' && link.target_id) {
      const event = stmts.getEventById.get(link.target_id, link.user_id);
      if (event) {
        data = {
          type: 'event',
          owner: user.username,
          event: {
            title: event.title,
            event_type: event.event_type,
            start_date: event.start_date,
            end_date: event.end_date,
            destination_state: event.destination_state,
            notes: event.notes
          }
        };
      }
    }

    res.json(data);
  } catch (err) {
    console.error('Shared view error:', err);
    res.status(500).json({ error: 'Failed to load shared content' });
  }
});

module.exports = router;
