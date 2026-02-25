import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import ChatWindow from '../components/chat/ChatWindow';
import ApiKeyInput from '../components/chat/ApiKeyInput';

export default function ChatPage() {
  const { user, fetchUser } = useAuth();
  const {
    sessions, currentSession, streaming,
    fetchSessions, createSession, loadSession, deleteSession, sendMessage
  } = useChat();
  const [streamingContent, setStreamingContent] = useState('');
  const [hasKey, setHasKey] = useState(user?.has_api_key);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { setHasKey(user?.has_api_key); }, [user?.has_api_key]);

  const handleNewChat = async () => {
    await createSession();
  };

  const handleSend = async (message) => {
    if (!currentSession) {
      const session = await createSession();
      setStreamingContent('');
      await sendMessage(session.id, message, (delta, full) => {
        setStreamingContent(full);
      });
      setStreamingContent('');
    } else {
      setStreamingContent('');
      await sendMessage(currentSession.id, message, (delta, full) => {
        setStreamingContent(full);
      });
      setStreamingContent('');
    }
  };

  if (!hasKey) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>AI Chat Assistant</Typography>
        <ApiKeyInput hasKey={false} onKeyUpdated={(val) => { setHasKey(val); fetchUser(); }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 112px)', gap: 2 }}>
      {/* Session list */}
      <Paper sx={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 1.5 }}>
          <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={handleNewChat} size="small">
            New Chat
          </Button>
        </Box>
        <Divider />
        <List sx={{ flexGrow: 1, overflow: 'auto' }} dense>
          {sessions.map(session => (
            <ListItem
              key={session.id}
              disablePadding
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => deleteSession(session.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton
                selected={currentSession?.id === session.id}
                onClick={() => loadSession(session.id)}
              >
                <ListItemText
                  primary={session.title}
                  primaryTypographyProps={{ noWrap: true, fontSize: '0.85rem' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat window */}
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatWindow
          messages={currentSession?.messages || []}
          streaming={streaming}
          streamingContent={streamingContent}
          onSend={handleSend}
        />
      </Paper>
    </Box>
  );
}
