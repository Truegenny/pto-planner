const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'pto-planner.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    pto_total_days INTEGER DEFAULT 15,
    work_schedule TEXT DEFAULT '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":false,"sun":false}',
    state TEXT DEFAULT 'CA',
    anthropic_api_key_encrypted TEXT,
    theme TEXT DEFAULT 'light',
    default_view TEXT DEFAULT 'year',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL DEFAULT 'general' CHECK(event_type IN ('pto','holiday','trip','general')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    color TEXT,
    destination_state TEXT,
    pto_days_used REAL DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    pto_days_required REAL DEFAULT 0,
    total_days_off INTEGER DEFAULT 0,
    holidays_leveraged TEXT DEFAULT '[]',
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft','confirmed')),
    suggested_by TEXT DEFAULT 'user' CHECK(suggested_by IN ('user','optimizer','ai')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT DEFAULT 'New Chat',
    messages TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS shared_links (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    link_type TEXT NOT NULL DEFAULT 'calendar' CHECK(link_type IN ('calendar','plan','event')),
    target_id TEXT,
    expires_at TEXT,
    password_hash TEXT,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
  CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
  CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_shared_links_user_id ON shared_links(user_id);
  CREATE INDEX IF NOT EXISTS idx_shared_links_active ON shared_links(is_active);
`);

const stmts = {
  // Users
  createUser: db.prepare(`INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)`),
  getUserById: db.prepare(`SELECT * FROM users WHERE id = ?`),
  getUserByUsername: db.prepare(`SELECT * FROM users WHERE username = ?`),
  getUserByEmail: db.prepare(`SELECT * FROM users WHERE email = ?`),
  updateUser: db.prepare(`UPDATE users SET username=?, email=?, pto_total_days=?, work_schedule=?, state=?, theme=?, default_view=?, updated_at=datetime('now') WHERE id=?`),
  updatePassword: db.prepare(`UPDATE users SET password=?, updated_at=datetime('now') WHERE id=?`),
  updateApiKey: db.prepare(`UPDATE users SET anthropic_api_key_encrypted=?, updated_at=datetime('now') WHERE id=?`),
  updatePtoConfig: db.prepare(`UPDATE users SET pto_total_days=?, work_schedule=?, state=?, updated_at=datetime('now') WHERE id=?`),

  // Events
  createEvent: db.prepare(`INSERT INTO events (id, user_id, title, description, event_type, start_date, end_date, color, destination_state, pto_days_used, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
  getEventById: db.prepare(`SELECT * FROM events WHERE id = ? AND user_id = ?`),
  getEventsByUser: db.prepare(`SELECT * FROM events WHERE user_id = ? ORDER BY start_date`),
  getEventsByUserAndDateRange: db.prepare(`SELECT * FROM events WHERE user_id = ? AND start_date <= ? AND end_date >= ? ORDER BY start_date`),
  getPtoSummary: db.prepare(`SELECT COALESCE(SUM(pto_days_used), 0) as used FROM events WHERE user_id = ? AND event_type IN ('pto', 'trip')`),
  updateEvent: db.prepare(`UPDATE events SET title=?, description=?, event_type=?, start_date=?, end_date=?, color=?, destination_state=?, pto_days_used=?, notes=?, updated_at=datetime('now') WHERE id=? AND user_id=?`),
  deleteEvent: db.prepare(`DELETE FROM events WHERE id = ? AND user_id = ?`),

  // Plans
  createPlan: db.prepare(`INSERT INTO plans (id, user_id, name, start_date, end_date, pto_days_required, total_days_off, holidays_leveraged, status, suggested_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
  getPlanById: db.prepare(`SELECT * FROM plans WHERE id = ? AND user_id = ?`),
  getPlansByUser: db.prepare(`SELECT * FROM plans WHERE user_id = ? ORDER BY start_date`),
  updatePlan: db.prepare(`UPDATE plans SET name=?, start_date=?, end_date=?, pto_days_required=?, total_days_off=?, holidays_leveraged=?, status=?, updated_at=datetime('now') WHERE id=? AND user_id=?`),
  deletePlan: db.prepare(`DELETE FROM plans WHERE id = ? AND user_id = ?`),
  confirmPlan: db.prepare(`UPDATE plans SET status='confirmed', updated_at=datetime('now') WHERE id=? AND user_id=?`),

  // Chat sessions
  createChatSession: db.prepare(`INSERT INTO chat_sessions (id, user_id, title, messages) VALUES (?, ?, ?, ?)`),
  getChatSessionById: db.prepare(`SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?`),
  getChatSessionsByUser: db.prepare(`SELECT id, user_id, title, created_at, updated_at FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC`),
  updateChatSession: db.prepare(`UPDATE chat_sessions SET title=?, messages=?, updated_at=datetime('now') WHERE id=? AND user_id=?`),
  deleteChatSession: db.prepare(`DELETE FROM chat_sessions WHERE id = ? AND user_id = ?`),

  // Shared links
  createSharedLink: db.prepare(`INSERT INTO shared_links (id, user_id, link_type, target_id, expires_at, password_hash, max_views) VALUES (?, ?, ?, ?, ?, ?, ?)`),
  getSharedLinkById: db.prepare(`SELECT * FROM shared_links WHERE id = ?`),
  getSharedLinksByUser: db.prepare(`SELECT * FROM shared_links WHERE user_id = ? ORDER BY created_at DESC`),
  incrementViewCount: db.prepare(`UPDATE shared_links SET view_count = view_count + 1 WHERE id = ?`),
  deactivateSharedLink: db.prepare(`UPDATE shared_links SET is_active = 0 WHERE id = ? AND user_id = ?`),
};

module.exports = { db, stmts };
