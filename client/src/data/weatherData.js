// Weather data is loaded dynamically from the API
// This file provides helper utilities for weather display

export const tempToColor = (temp) => {
  if (temp >= 90) return '#d32f2f';
  if (temp >= 80) return '#f44336';
  if (temp >= 70) return '#ff9800';
  if (temp >= 60) return '#ffc107';
  if (temp >= 50) return '#8bc34a';
  if (temp >= 40) return '#4caf50';
  if (temp >= 30) return '#00bcd4';
  if (temp >= 20) return '#2196f3';
  return '#1565c0';
};

export const tempToLabel = (temp) => {
  if (temp >= 90) return 'Very Hot';
  if (temp >= 80) return 'Hot';
  if (temp >= 70) return 'Warm';
  if (temp >= 60) return 'Pleasant';
  if (temp >= 50) return 'Mild';
  if (temp >= 40) return 'Cool';
  if (temp >= 30) return 'Cold';
  return 'Very Cold';
};
