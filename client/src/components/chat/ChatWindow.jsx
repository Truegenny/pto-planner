import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import ChatMessage from './ChatMessage';

export default function ChatWindow({ messages = [], streaming, streamingContent, onSend }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = () => {
    if (!input.trim() || streaming) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.length === 0 && !streaming && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Start a conversation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ask about PTO optimization, trip planning, weather, or anything related to your 2026 calendar.
            </Typography>
          </Box>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {streaming && streamingContent && (
          <ChatMessage message={{ role: 'assistant', content: streamingContent }} />
        )}
        {streaming && !streamingContent && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">Thinking...</Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Ask about PTO planning..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          multiline
          maxRows={4}
          size="small"
          disabled={streaming}
        />
        <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || streaming}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
