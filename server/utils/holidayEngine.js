const holidays = require('../data/holidays2026.json');

function getFederalHolidays() {
  return holidays.federal;
}

function getStateHolidays(stateCode) {
  return holidays.state_holidays[stateCode] || [];
}

function getAllHolidaysForState(stateCode) {
  return [...holidays.federal, ...getStateHolidays(stateCode)].sort(
    (a, b) => a.date.localeCompare(b.date)
  );
}

function getCommonObservances() {
  return holidays.common_observances;
}

function isHoliday(dateStr, stateCode) {
  const allHolidays = getAllHolidaysForState(stateCode);
  return allHolidays.find(h => h.date === dateStr) || null;
}

function getHolidayMap(stateCode) {
  const map = {};
  const allHolidays = getAllHolidaysForState(stateCode);
  for (const h of allHolidays) {
    map[h.date] = h;
  }
  return map;
}

module.exports = { getFederalHolidays, getStateHolidays, getAllHolidaysForState, getCommonObservances, isHoliday, getHolidayMap };
