import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ShareDialog from '../components/sharing/ShareDialog';
import api from '../api';

export default function SharingPage() {
  const [links, setLinks] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchLinks = async () => {
    try {
      const { data } = await api.get('/share/links');
      setLinks(data.links);
    } catch (err) {
      console.error('Failed to fetch links:', err);
    }
  };

  useEffect(() => { fetchLinks(); }, []);

  const deactivateLink = async (id) => {
    await api.delete(`/share/links/${id}`);
    fetchLinks();
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/shared/${id}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Sharing</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Create Link
        </Button>
      </Box>

      {links.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>No shared links yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Create a magic link to share your calendar, plans, or events with others.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Views</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {links.map(link => (
                <TableRow key={link.id}>
                  <TableCell>
                    <Chip label={link.link_type} size="small" />
                    {link.has_password && <Chip label="password" size="small" sx={{ ml: 0.5 }} variant="outlined" />}
                  </TableCell>
                  <TableCell>{new Date(link.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{link.expires_at ? new Date(link.expires_at).toLocaleString() : 'Never'}</TableCell>
                  <TableCell>{link.view_count}{link.max_views ? ` / ${link.max_views}` : ''}</TableCell>
                  <TableCell>
                    <Chip
                      label={link.is_active ? 'Active' : 'Inactive'}
                      color={link.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => copyLink(link.id)} title="Copy link">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    {link.is_active && (
                      <IconButton size="small" onClick={() => deactivateLink(link.id)} title="Deactivate" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ShareDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={fetchLinks} />
    </Box>
  );
}
