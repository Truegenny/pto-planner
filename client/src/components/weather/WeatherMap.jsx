import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

// Simplified US state positions for an SVG grid representation
const statePositions = {
  ME: [10, 0], VT: [9, 0], NH: [10, 1], MA: [10, 2], RI: [10, 3], CT: [9, 3],
  NY: [8, 1], NJ: [9, 2], PA: [8, 2], DE: [9, 4], MD: [8, 3], DC: [8, 4],
  VA: [7, 3], WV: [7, 2], NC: [7, 4], SC: [7, 5], GA: [6, 5], FL: [6, 6],
  AL: [5, 5], MS: [4, 5], TN: [5, 4], KY: [6, 3], OH: [7, 1], IN: [6, 1],
  IL: [5, 1], MI: [6, 0], WI: [5, 0], MN: [4, 0], IA: [4, 1], MO: [4, 2],
  AR: [4, 4], LA: [4, 6], TX: [3, 5], OK: [3, 3], KS: [3, 2], NE: [3, 1],
  SD: [2, 0], ND: [2, 1], MT: [1, 0], WY: [1, 1], CO: [2, 2], NM: [2, 4],
  AZ: [1, 4], UT: [1, 2], NV: [0, 2], ID: [0, 1], OR: [0, 0], WA: [0, -1],
  CA: [0, 3], AK: [-1, 6], HI: [0, 7],
};

function getTempColor(temp) {
  if (temp >= 90) return '#d32f2f';
  if (temp >= 80) return '#f44336';
  if (temp >= 70) return '#ff9800';
  if (temp >= 60) return '#ffc107';
  if (temp >= 50) return '#8bc34a';
  if (temp >= 40) return '#4caf50';
  if (temp >= 30) return '#00bcd4';
  if (temp >= 20) return '#2196f3';
  return '#1565c0';
}

export default function WeatherMap({ weatherData, month, onStateClick }) {
  const [hoveredState, setHoveredState] = useState(null);

  if (!weatherData) return null;

  const cellSize = 52;
  const padding = 20;

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <svg width={600} height={480} viewBox={`0 0 600 480`}>
        {Object.entries(statePositions).map(([code, [col, row]]) => {
          const stateData = weatherData[code];
          if (!stateData) return null;
          const monthWeather = stateData.months?.[String(month)];
          if (!monthWeather) return null;
          const x = padding + (col + 1) * cellSize;
          const y = padding + (row + 1) * cellSize;
          const color = getTempColor(monthWeather.high);
          const isHovered = hoveredState === code;

          return (
            <g
              key={code}
              onClick={() => onStateClick?.(code)}
              onMouseEnter={() => setHoveredState(code)}
              onMouseLeave={() => setHoveredState(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x} y={y} width={cellSize - 4} height={cellSize - 4}
                rx={6} ry={6}
                fill={color}
                opacity={isHovered ? 1 : 0.85}
                stroke={isHovered ? '#fff' : 'none'}
                strokeWidth={2}
              />
              <text
                x={x + (cellSize - 4) / 2} y={y + 18}
                textAnchor="middle" fill="white"
                fontSize="12" fontWeight="bold"
              >
                {code}
              </text>
              <text
                x={x + (cellSize - 4) / 2} y={y + 34}
                textAnchor="middle" fill="white"
                fontSize="11"
              >
                {monthWeather.high}°
              </text>
            </g>
          );
        })}
        {/* Legend */}
        <text x={20} y={460} fill="currentColor" fontSize="11">
          Cold ← → Hot
        </text>
        {[20, 30, 40, 50, 60, 70, 80, 90].map((temp, i) => (
          <rect key={temp} x={100 + i * 30} y={448} width={28} height={14} rx={3} fill={getTempColor(temp)} />
        ))}
      </svg>
    </Box>
  );
}
