import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 2 }}>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '80%',
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? 'white' : 'text.primary',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          '& p': { m: 0 },
          '& pre': {
            bgcolor: 'rgba(0,0,0,0.1)',
            p: 1,
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.85rem',
          },
          '& code': { fontSize: '0.85rem' },
          '& ul, & ol': { pl: 2, m: 0 },
        }}
      >
        {isUser ? (
          <Typography variant="body1">{message.content}</Typography>
        ) : (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}
      </Paper>
    </Box>
  );
}
