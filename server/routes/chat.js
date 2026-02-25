const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { stmts } = require('../db');
const { auth } = require('../middleware/auth');
const { decrypt } = require('../utils/crypto');

const router = express.Router();
router.use(auth);

router.get('/sessions', (req, res) => {
  try {
    const sessions = stmts.getChatSessionsByUser.all(req.userId);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.post('/sessions', (req, res) => {
  try {
    const id = uuidv4();
    const { title } = req.body;
    stmts.createChatSession.run(id, req.userId, title || 'New Chat', '[]');
    const session = stmts.getChatSessionById.get(id, req.userId);
    res.status(201).json({ session: parseSession(session) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

router.get('/sessions/:id', (req, res) => {
  try {
    const session = stmts.getChatSessionById.get(req.params.id, req.userId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ session: parseSession(session) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

router.delete('/sessions/:id', (req, res) => {
  try {
    const result = stmts.deleteChatSession.run(req.params.id, req.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

router.post('/sessions/:id/messages', async (req, res) => {
  try {
    const session = stmts.getChatSessionById.get(req.params.id, req.userId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const user = stmts.getUserById.get(req.userId);
    if (!user.anthropic_api_key_encrypted) {
      return res.status(400).json({ error: 'Anthropic API key not configured. Add it in Settings.' });
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const apiKey = decrypt(user.anthropic_api_key_encrypted);
    const messages = JSON.parse(session.messages);
    messages.push({ role: 'user', content: message });

    // Build system context
    const events = stmts.getEventsByUser.all(req.userId);
    const ptoSummary = stmts.getPtoSummary.get(req.userId);
    const workSchedule = typeof user.work_schedule === 'string' ? JSON.parse(user.work_schedule) : user.work_schedule;

    const systemPrompt = buildSystemPrompt(user, events, ptoSummary, workSchedule);

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const anthropicMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4096,
          system: systemPrompt,
          messages: anthropicMessages,
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        res.write(`data: ${JSON.stringify({ type: 'error', error: `API error: ${response.status}` })}\n\n`);
        res.end();
        return;
      }

      let assistantContent = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                assistantContent += parsed.delta.text;
                res.write(`data: ${JSON.stringify({ type: 'delta', text: parsed.delta.text })}\n\n`);
              }
            } catch (e) {
              // Skip unparseable chunks
            }
          }
        }
      }

      // Save the complete conversation
      messages.push({ role: 'assistant', content: assistantContent });

      // Auto-title on first message
      let title = session.title;
      if (title === 'New Chat' && messages.length === 2) {
        title = message.slice(0, 60) + (message.length > 60 ? '...' : '');
      }

      stmts.updateChatSession.run(title, JSON.stringify(messages), req.params.id, req.userId);

      res.write(`data: ${JSON.stringify({ type: 'done', message_count: messages.length })}\n\n`);
      res.end();
    } catch (apiErr) {
      console.error('Anthropic API error:', apiErr);
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Failed to connect to Anthropic API' })}\n\n`);
      res.end();
    }
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Chat failed' });
    }
  }
});

function buildSystemPrompt(user, events, ptoSummary, workSchedule) {
  const workDays = Object.entries(workSchedule)
    .filter(([, v]) => v)
    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
    .join(', ');

  const eventsSummary = events.map(e =>
    `- ${e.title} (${e.event_type}): ${e.start_date} to ${e.end_date}${e.destination_state ? ` in ${e.destination_state}` : ''}`
  ).join('\n') || 'No events scheduled yet.';

  return `You are a helpful PTO and vacation planning assistant for 2026. You help users optimize their time off, suggest trip destinations, and plan vacations.

## User's Profile
- State: ${user.state}
- PTO Budget: ${user.pto_total_days} days total, ${ptoSummary.used} used, ${user.pto_total_days - ptoSummary.used} remaining
- Work Schedule: ${workDays}

## Current Calendar Events
${eventsSummary}

## Guidelines
- Help users maximize their days off by leveraging holidays and weekends
- Consider weather and seasonal activities when suggesting destinations
- Be specific about dates and PTO costs
- Suggest efficient PTO strategies (e.g., taking a Friday off to create a 4-day weekend around a Monday holiday)
- When discussing trips, mention relevant weather considerations
- Keep responses concise and actionable`;
}

function parseSession(session) {
  return {
    ...session,
    messages: typeof session.messages === 'string' ? JSON.parse(session.messages) : session.messages
  };
}

module.exports = router;
