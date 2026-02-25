import { useState, useCallback } from 'react';
import api from '../api';

export function useChat() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [streaming, setStreaming] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/sessions');
      setSessions(data.sessions);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  }, []);

  const createSession = useCallback(async (title) => {
    const { data } = await api.post('/chat/sessions', { title });
    setSessions(prev => [data.session, ...prev]);
    setCurrentSession(data.session);
    return data.session;
  }, []);

  const loadSession = useCallback(async (id) => {
    const { data } = await api.get(`/chat/sessions/${id}`);
    setCurrentSession(data.session);
    return data.session;
  }, []);

  const deleteSession = useCallback(async (id) => {
    await api.delete(`/chat/sessions/${id}`);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSession?.id === id) setCurrentSession(null);
  }, [currentSession]);

  const sendMessage = useCallback(async (sessionId, message, onDelta) => {
    setStreaming(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.type === 'delta') {
                fullResponse += parsed.text;
                onDelta?.(parsed.text, fullResponse);
              } else if (parsed.type === 'error') {
                throw new Error(parsed.error);
              }
            } catch (e) {
              if (e.message && !e.message.includes('JSON')) throw e;
            }
          }
        }
      }

      // Refresh session to get updated messages
      await loadSession(sessionId);
      await fetchSessions();
      return fullResponse;
    } finally {
      setStreaming(false);
    }
  }, [loadSession, fetchSessions]);

  return { sessions, currentSession, streaming, fetchSessions, createSession, loadSession, deleteSession, sendMessage, setCurrentSession };
}
