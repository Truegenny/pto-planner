import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthSelector({ value, onChange }) {
  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(e, v) => v !== null && onChange(v)}
        size="small"
      >
        {months.map((m, i) => (
          <ToggleButton key={i} value={i + 1} sx={{ px: 1.5 }}>
            {m}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
