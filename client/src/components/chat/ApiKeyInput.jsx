import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import api from '../../api';

export default function ApiKeyInput({ hasKey, onKeyUpdated }) {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/api-key', { api_key: apiKey });
      setMessage('API key saved successfully');
      setApiKey('');
      onKeyUpdated?.(true);
    } catch (err) {
      setMessage('Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    try {
      await api.put('/auth/api-key', { api_key: null });
      setMessage('API key removed');
      onKeyUpdated?.(false);
    } catch (err) {
      setMessage('Failed to remove API key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, textAlign: 'center', maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {hasKey ? 'API Key Configured' : 'Anthropic API Key Required'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {hasKey
          ? 'Your API key is securely stored. You can update or remove it below.'
          : 'To use the AI chat assistant, enter your Anthropic API key. It will be encrypted and stored securely.'
        }
      </Typography>
      {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="sk-ant-..."
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
        />
        <Button variant="contained" onClick={handleSave} disabled={!apiKey || saving}>
          {hasKey ? 'Update' : 'Save'}
        </Button>
        {hasKey && (
          <Button variant="outlined" color="error" onClick={handleRemove} disabled={saving}>
            Remove
          </Button>
        )}
      </Box>
    </Box>
  );
}
