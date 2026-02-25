const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pto-planner-dev-secret-change-in-production';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      const payload = jwt.verify(token, JWT_SECRET);
      req.userId = payload.userId;
    } catch (err) {
      // Ignore invalid tokens for optional auth
    }
  }
  next();
}

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { auth, optionalAuth, generateToken, JWT_SECRET };
