require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later' }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/optimizer', require('./routes/optimizer'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/share', require('./routes/sharing'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PTO Planner API running on port ${PORT}`);
});
