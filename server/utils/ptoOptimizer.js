const { getHolidayMap } = require('./holidayEngine');

function buildYearMap(workSchedule, stateCode) {
  const holidayMap = getHolidayMap(stateCode);
  const dayMap = {};
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const schedule = typeof workSchedule === 'string' ? JSON.parse(workSchedule) : workSchedule;

  const start = new Date(2026, 0, 1);
  const end = new Date(2026, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const dayName = dayNames[dayOfWeek];
    const isWorkday = schedule[dayName] === true;
    const holiday = holidayMap[dateStr];

    dayMap[dateStr] = {
      date: dateStr,
      dayOfWeek,
      dayName,
      isWorkday,
      isHoliday: !!holiday,
      holidayName: holiday ? holiday.name : null,
      isWeekend: !schedule[dayName],
      needsPto: isWorkday && !holiday
    };
  }

  return dayMap;
}

function generateSuggestions(workSchedule, stateCode, existingEvents = []) {
  const dayMap = buildYearMap(workSchedule, stateCode);
  const dates = Object.keys(dayMap).sort();
  const suggestions = [];

  // Create a set of dates already used for PTO
  const usedDates = new Set();
  for (const evt of existingEvents) {
    if (evt.event_type === 'pto' || evt.event_type === 'trip') {
      let d = new Date(evt.start_date);
      const end = new Date(evt.end_date);
      while (d <= end) {
        usedDates.add(d.toISOString().slice(0, 10));
        d.setDate(d.getDate() + 1);
      }
    }
  }

  // Sliding window: try all windows from 3 to 16 days
  for (let windowSize = 3; windowSize <= 16; windowSize++) {
    for (let i = 0; i <= dates.length - windowSize; i++) {
      const windowDates = dates.slice(i, i + windowSize);
      const startDate = windowDates[0];
      const endDate = windowDates[windowDates.length - 1];

      // Count PTO days needed and total days off
      let ptoDaysNeeded = 0;
      let totalDaysOff = windowSize;
      let holidaysInWindow = [];
      let hasConflict = false;

      for (const dateStr of windowDates) {
        const day = dayMap[dateStr];
        if (usedDates.has(dateStr)) {
          hasConflict = true;
          break;
        }
        if (day.needsPto) {
          ptoDaysNeeded++;
        }
        if (day.isHoliday) {
          holidaysInWindow.push({ name: day.holidayName, date: dateStr });
        }
      }

      if (hasConflict) continue;

      // Must leverage at least one holiday or weekend
      if (holidaysInWindow.length === 0) continue;

      // Skip if no PTO needed (all weekends/holidays)
      if (ptoDaysNeeded === 0) continue;

      const efficiency = totalDaysOff / ptoDaysNeeded;

      // Only suggest if efficiency >= 1.5 (50% bonus days)
      if (efficiency >= 1.5) {
        suggestions.push({
          start_date: startDate,
          end_date: endDate,
          total_days_off: totalDaysOff,
          pto_days_required: ptoDaysNeeded,
          efficiency: Math.round(efficiency * 100) / 100,
          holidays_leveraged: holidaysInWindow,
          holiday_cluster: holidaysInWindow.map(h => h.name).join(', ')
        });
      }
    }
  }

  // Group by holiday cluster and pick top per cluster
  const clusterMap = {};
  for (const s of suggestions) {
    const key = s.holiday_cluster;
    if (!clusterMap[key]) clusterMap[key] = [];
    clusterMap[key].push(s);
  }

  const topSuggestions = [];
  for (const [cluster, items] of Object.entries(clusterMap)) {
    items.sort((a, b) => b.efficiency - a.efficiency || b.total_days_off - a.total_days_off);
    // Take top 3 per cluster
    topSuggestions.push(...items.slice(0, 3));
  }

  // Sort by date
  topSuggestions.sort((a, b) => a.start_date.localeCompare(b.start_date));

  return topSuggestions;
}

function analyzeDateRange(startDate, endDate, workSchedule, stateCode) {
  const dayMap = buildYearMap(workSchedule, stateCode);
  let ptoDaysNeeded = 0;
  let weekends = 0;
  let holidays = [];
  let totalDays = 0;

  let d = new Date(startDate);
  const end = new Date(endDate);

  while (d <= end) {
    const dateStr = d.toISOString().slice(0, 10);
    const day = dayMap[dateStr];
    if (day) {
      totalDays++;
      if (day.needsPto) ptoDaysNeeded++;
      if (day.isWeekend) weekends++;
      if (day.isHoliday) holidays.push({ name: day.holidayName, date: dateStr });
    }
    d.setDate(d.getDate() + 1);
  }

  return {
    start_date: startDate,
    end_date: endDate,
    total_days: totalDays,
    pto_days_required: ptoDaysNeeded,
    weekends,
    holidays_leveraged: holidays,
    efficiency: ptoDaysNeeded > 0 ? Math.round((totalDays / ptoDaysNeeded) * 100) / 100 : Infinity
  };
}

module.exports = { buildYearMap, generateSuggestions, analyzeDateRange };
