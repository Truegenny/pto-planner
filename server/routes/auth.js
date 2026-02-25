const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { stmts } = require('../db');
const { auth, generateToken } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/crypto');

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = stmts.getUserByUsername.get(username) || stmts.getUserByEmail.get(email);
    if (existing) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }
    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    stmts.createUser.run(id, username, email, hash);
    const token = generateToken(id);
    const user = stmts.getUserById.get(id);
    res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = stmts.getUserByUsername.get(username) || stmts.getUserByEmail.get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user.id);
    res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', auth, (req, res) => {
  try {
    const user = stmts.getUserById.get(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.put('/me', auth, (req, res) => {
  try {
    const user = stmts.getUserById.get(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { username, email, pto_total_days, work_schedule, state, theme, default_view } = req.body;
    stmts.updateUser.run(
      username || user.username,
      email || user.email,
      pto_total_days ?? user.pto_total_days,
      work_schedule ? JSON.stringify(work_schedule) : user.work_schedule,
      state || user.state,
      theme || user.theme,
      default_view || user.default_view,
      req.userId
    );
    const updated = stmts.getUserById.get(req.userId);
    res.json({ user: sanitizeUser(updated) });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.put('/password', auth, (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    const user = stmts.getUserById.get(req.userId);
    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const hash = bcrypt.hashSync(new_password, 10);
    stmts.updatePassword.run(hash, req.userId);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

router.put('/pto-config', auth, (req, res) => {
  try {
    const { pto_total_days, work_schedule, state } = req.body;
    const user = stmts.getUserById.get(req.userId);
    stmts.updatePtoConfig.run(
      pto_total_days ?? user.pto_total_days,
      work_schedule ? JSON.stringify(work_schedule) : user.work_schedule,
      state || user.state,
      req.userId
    );
    const updated = stmts.getUserById.get(req.userId);
    res.json({ user: sanitizeUser(updated) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update PTO config' });
  }
});

router.put('/api-key', auth, (req, res) => {
  try {
    const { api_key } = req.body;
    const encrypted = api_key ? encrypt(api_key) : null;
    stmts.updateApiKey.run(encrypted, req.userId);
    res.json({ message: 'API key updated', has_key: !!api_key });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

function sanitizeUser(user) {
  const { password, anthropic_api_key_encrypted, ...safe } = user;
  return {
    ...safe,
    work_schedule: typeof safe.work_schedule === 'string' ? JSON.parse(safe.work_schedule) : safe.work_schedule,
    has_api_key: !!anthropic_api_key_encrypted
  };
}

module.exports = router;
