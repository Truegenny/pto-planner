export const federalHolidays = [
  { name: "New Year's Day", date: "2026-01-01" },
  { name: "Martin Luther King Jr. Day", date: "2026-01-19" },
  { name: "Presidents' Day", date: "2026-02-16" },
  { name: "Memorial Day", date: "2026-05-25" },
  { name: "Juneteenth", date: "2026-06-19" },
  { name: "Independence Day (Observed)", date: "2026-07-03" },
  { name: "Independence Day", date: "2026-07-04" },
  { name: "Labor Day", date: "2026-09-07" },
  { name: "Columbus Day", date: "2026-10-12" },
  { name: "Veterans Day", date: "2026-11-11" },
  { name: "Thanksgiving Day", date: "2026-11-26" },
  { name: "Day After Thanksgiving", date: "2026-11-27" },
  { name: "Christmas Eve", date: "2026-12-24" },
  { name: "Christmas Day", date: "2026-12-25" },
];

export const holidayMap = {};
federalHolidays.forEach(h => { holidayMap[h.date] = h.name; });
