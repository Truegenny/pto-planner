import { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';

export default function ExportMenu({ targetRef }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleExport = async (type) => {
    setAnchorEl(null);
    const el = targetRef?.current || document.getElementById('export-target');
    if (!el) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });

      if (type === 'png') {
        const link = document.createElement('a');
        link.download = 'pto-planner-export.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else if (type === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('pto-planner-export.pdf');
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <>
      <Button startIcon={<DownloadIcon />} onClick={e => setAnchorEl(e.currentTarget)} variant="outlined" size="small">
        Export
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
          Export as PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('png')}>
          <ListItemIcon><ImageIcon fontSize="small" /></ListItemIcon>
          Export as PNG
        </MenuItem>
      </Menu>
    </>
  );
}
