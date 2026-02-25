// This script generates weatherAverages.json — run with: node generateWeather.js
const fs = require('fs');
const path = require('path');

const statesData = {
  AL: { name: "Alabama", region: "Southeast", base: { summer: 92, winter: 53, precip: 4.5, humid: 72 } },
  AK: { name: "Alaska", region: "Pacific", base: { summer: 65, winter: 22, precip: 1.5, humid: 65 } },
  AZ: { name: "Arizona", region: "Southwest", base: { summer: 106, winter: 67, precip: 0.8, humid: 25 } },
  AR: { name: "Arkansas", region: "Southeast", base: { summer: 93, winter: 51, precip: 4.2, humid: 70 } },
  CA: { name: "California", region: "Pacific", base: { summer: 89, winter: 68, precip: 1.0, humid: 50 } },
  CO: { name: "Colorado", region: "West", base: { summer: 88, winter: 45, precip: 1.5, humid: 40 } },
  CT: { name: "Connecticut", region: "Northeast", base: { summer: 84, winter: 37, precip: 3.8, humid: 68 } },
  DE: { name: "Delaware", region: "Northeast", base: { summer: 87, winter: 42, precip: 3.5, humid: 70 } },
  FL: { name: "Florida", region: "Southeast", base: { summer: 92, winter: 72, precip: 3.5, humid: 75 } },
  GA: { name: "Georgia", region: "Southeast", base: { summer: 92, winter: 54, precip: 4.2, humid: 72 } },
  HI: { name: "Hawaii", region: "Pacific", base: { summer: 88, winter: 80, precip: 2.0, humid: 70 } },
  ID: { name: "Idaho", region: "West", base: { summer: 89, winter: 36, precip: 1.2, humid: 45 } },
  IL: { name: "Illinois", region: "Midwest", base: { summer: 86, winter: 33, precip: 3.5, humid: 68 } },
  IN: { name: "Indiana", region: "Midwest", base: { summer: 85, winter: 35, precip: 3.6, humid: 70 } },
  IA: { name: "Iowa", region: "Midwest", base: { summer: 86, winter: 28, precip: 3.3, humid: 68 } },
  KS: { name: "Kansas", region: "Midwest", base: { summer: 93, winter: 41, precip: 2.8, humid: 62 } },
  KY: { name: "Kentucky", region: "Southeast", base: { summer: 88, winter: 42, precip: 4.0, humid: 70 } },
  LA: { name: "Louisiana", region: "Southeast", base: { summer: 93, winter: 60, precip: 5.2, humid: 78 } },
  ME: { name: "Maine", region: "Northeast", base: { summer: 79, winter: 27, precip: 3.5, humid: 70 } },
  MD: { name: "Maryland", region: "Northeast", base: { summer: 88, winter: 43, precip: 3.5, humid: 68 } },
  MA: { name: "Massachusetts", region: "Northeast", base: { summer: 82, winter: 36, precip: 3.7, humid: 68 } },
  MI: { name: "Michigan", region: "Midwest", base: { summer: 82, winter: 30, precip: 2.8, humid: 68 } },
  MN: { name: "Minnesota", region: "Midwest", base: { summer: 83, winter: 22, precip: 2.8, humid: 67 } },
  MS: { name: "Mississippi", region: "Southeast", base: { summer: 93, winter: 55, precip: 5.0, humid: 75 } },
  MO: { name: "Missouri", region: "Midwest", base: { summer: 90, winter: 40, precip: 3.5, humid: 68 } },
  MT: { name: "Montana", region: "West", base: { summer: 85, winter: 30, precip: 1.5, humid: 48 } },
  NE: { name: "Nebraska", region: "Midwest", base: { summer: 89, winter: 33, precip: 2.5, humid: 62 } },
  NV: { name: "Nevada", region: "West", base: { summer: 104, winter: 55, precip: 0.5, humid: 22 } },
  NH: { name: "New Hampshire", region: "Northeast", base: { summer: 81, winter: 30, precip: 3.5, humid: 68 } },
  NJ: { name: "New Jersey", region: "Northeast", base: { summer: 86, winter: 40, precip: 4.0, humid: 68 } },
  NM: { name: "New Mexico", region: "Southwest", base: { summer: 93, winter: 52, precip: 1.2, humid: 30 } },
  NY: { name: "New York", region: "Northeast", base: { summer: 84, winter: 35, precip: 3.8, humid: 67 } },
  NC: { name: "North Carolina", region: "Southeast", base: { summer: 89, winter: 50, precip: 3.8, humid: 70 } },
  ND: { name: "North Dakota", region: "Midwest", base: { summer: 84, winter: 18, precip: 1.8, humid: 65 } },
  OH: { name: "Ohio", region: "Midwest", base: { summer: 84, winter: 35, precip: 3.2, humid: 70 } },
  OK: { name: "Oklahoma", region: "Southwest", base: { summer: 94, winter: 49, precip: 3.5, humid: 62 } },
  OR: { name: "Oregon", region: "Pacific", base: { summer: 82, winter: 46, precip: 3.5, humid: 65 } },
  PA: { name: "Pennsylvania", region: "Northeast", base: { summer: 85, winter: 36, precip: 3.4, humid: 68 } },
  RI: { name: "Rhode Island", region: "Northeast", base: { summer: 82, winter: 37, precip: 4.0, humid: 68 } },
  SC: { name: "South Carolina", region: "Southeast", base: { summer: 92, winter: 56, precip: 3.8, humid: 72 } },
  SD: { name: "South Dakota", region: "Midwest", base: { summer: 87, winter: 25, precip: 2.0, humid: 60 } },
  TN: { name: "Tennessee", region: "Southeast", base: { summer: 90, winter: 48, precip: 4.5, humid: 70 } },
  TX: { name: "Texas", region: "Southwest", base: { summer: 96, winter: 57, precip: 2.5, humid: 60 } },
  UT: { name: "Utah", region: "West", base: { summer: 95, winter: 40, precip: 1.2, humid: 35 } },
  VT: { name: "Vermont", region: "Northeast", base: { summer: 80, winter: 27, precip: 3.3, humid: 68 } },
  VA: { name: "Virginia", region: "Southeast", base: { summer: 87, winter: 46, precip: 3.5, humid: 68 } },
  WA: { name: "Washington", region: "Pacific", base: { summer: 77, winter: 45, precip: 3.5, humid: 70 } },
  WV: { name: "West Virginia", region: "Southeast", base: { summer: 84, winter: 38, precip: 3.5, humid: 70 } },
  WI: { name: "Wisconsin", region: "Midwest", base: { summer: 82, winter: 25, precip: 2.8, humid: 68 } },
  WY: { name: "Wyoming", region: "West", base: { summer: 84, winter: 33, precip: 1.0, humid: 42 } },
};

const monthDescriptions = {
  Southeast: [
    "Cool with occasional rain", "Mild and pleasant", "Warm spring weather", "Warm with thunderstorms",
    "Hot and humid", "Hot, humid, afternoon storms", "Hottest month, very humid",
    "Hot and humid with storms", "Warm, hurricane season", "Pleasant fall weather",
    "Cool and comfortable", "Cool with holiday cheer"
  ],
  Northeast: [
    "Cold, snowy winters", "Cold with snow possible", "Chilly, early spring",
    "Mild spring, rain showers", "Warm and pleasant", "Warm, start of summer",
    "Hot and humid", "Warm, late summer", "Pleasant early fall",
    "Cool, beautiful foliage", "Cold, late autumn", "Cold and snowy"
  ],
  Midwest: [
    "Very cold, snowy", "Cold, windy", "Cold to cool, thawing", "Mild spring weather",
    "Warm and pleasant", "Hot, thunderstorm season", "Hot and humid",
    "Warm, late summer", "Pleasant early fall", "Cool, harvest season",
    "Cold, first snow possible", "Cold and snowy"
  ],
  Southwest: [
    "Cool and dry", "Mild and dry", "Warm and sunny", "Hot, dry conditions",
    "Very hot, minimal rain", "Extremely hot, monsoon start", "Hottest month, monsoons",
    "Very hot, monsoon rain", "Hot, monsoons ending", "Warm and pleasant",
    "Mild and dry", "Cool and dry"
  ],
  West: [
    "Cold, snow in mountains", "Cold, late winter", "Cool, spring approaching",
    "Mild, some rain/snow", "Warm and pleasant", "Hot days, cool nights",
    "Hot and dry", "Hot and dry", "Warm, pleasant evenings",
    "Cool, early snow possible", "Cold, winter arriving", "Cold with snow"
  ],
  Pacific: [
    "Cool, rainy season", "Cool with rain", "Mild, rain decreasing", "Mild and pleasant",
    "Warm and dry", "Warm, mostly dry", "Warm, dry summer", "Warm, dry conditions",
    "Warm, dry early fall", "Cool, rain returning", "Cool, rainy season begins", "Cool and rainy"
  ],
};

// Seasonal temperature curves (multipliers from winter base to summer base)
const seasonalCurve = [0, 0.05, 0.2, 0.45, 0.7, 0.88, 1.0, 0.95, 0.75, 0.5, 0.2, 0.02];
// Precipitation seasonal variation
const precipCurve = {
  Southeast: [1.0, 1.0, 1.1, 1.0, 1.0, 1.2, 1.3, 1.2, 0.9, 0.7, 0.8, 1.0],
  Northeast: [0.9, 0.8, 1.0, 1.0, 1.1, 1.1, 1.1, 1.0, 1.0, 0.9, 0.9, 0.9],
  Midwest: [0.7, 0.7, 0.9, 1.1, 1.2, 1.3, 1.1, 1.1, 0.9, 0.8, 0.8, 0.7],
  Southwest: [0.8, 0.7, 0.5, 0.3, 0.4, 0.6, 1.5, 1.5, 1.0, 0.7, 0.5, 0.7],
  West: [1.2, 1.0, 0.9, 0.8, 0.7, 0.4, 0.3, 0.3, 0.5, 0.7, 1.0, 1.3],
  Pacific: [1.5, 1.3, 1.0, 0.7, 0.4, 0.2, 0.1, 0.2, 0.4, 0.8, 1.3, 1.5],
};

const snowCurve = [1.2, 1.0, 0.6, 0.1, 0, 0, 0, 0, 0, 0.05, 0.4, 1.1];

const sunnyCurve = {
  Southeast: [10, 11, 13, 15, 17, 16, 15, 15, 15, 17, 14, 11],
  Northeast: [8, 9, 11, 12, 15, 16, 17, 16, 14, 12, 9, 8],
  Midwest: [7, 8, 10, 12, 15, 16, 17, 16, 15, 13, 8, 7],
  Southwest: [15, 16, 19, 22, 25, 26, 22, 22, 24, 22, 18, 15],
  West: [8, 9, 12, 14, 18, 22, 25, 24, 22, 16, 10, 8],
  Pacific: [7, 8, 11, 14, 18, 21, 25, 24, 22, 14, 8, 6],
};

function generateState(code) {
  const info = statesData[code];
  const { summer, winter, precip, humid } = info.base;
  const tempRange = summer - winter;
  const region = info.region;
  const months = {};

  for (let m = 1; m <= 12; m++) {
    const idx = m - 1;
    const high = Math.round(winter + tempRange * seasonalCurve[idx]);
    const low = Math.round(high - (15 + Math.random() * 5));
    const avg = Math.round((high + low) / 2);
    const precipitation = +(precip * (precipCurve[region]?.[idx] || 1)).toFixed(1);
    // Snow only if high < 45
    const baseSnow = high < 45 ? (50 - high) * 0.2 * (snowCurve[idx] || 0) : 0;
    const snow = +(Math.max(0, baseSnow)).toFixed(1);
    const sunny_days = (sunnyCurve[region]?.[idx] || 14) + Math.round((Math.random() - 0.5) * 2);
    const humidAdj = seasonalCurve[idx] * 8 - 4;
    const humidity = Math.round(Math.min(95, Math.max(20, humid + humidAdj)));
    const description = monthDescriptions[region]?.[idx] || "Typical weather";

    months[String(m)] = { high, low, avg, precipitation, snow, sunny_days, humidity, description };
  }

  return { name: info.name, region: info.region, months };
}

const result = {
  states: {},
  regions: {
    Northeast: ["CT","DE","ME","MD","MA","NH","NJ","NY","PA","RI","VT"],
    Southeast: ["AL","AR","FL","GA","KY","LA","MS","NC","SC","TN","VA","WV"],
    Midwest: ["IL","IN","IA","KS","MI","MN","MO","NE","ND","OH","SD","WI"],
    Southwest: ["AZ","NM","OK","TX"],
    West: ["CO","ID","MT","NV","UT","WY"],
    Pacific: ["AK","CA","HI","OR","WA"]
  }
};

for (const code of Object.keys(statesData).sort()) {
  result.states[code] = generateState(code);
}

fs.writeFileSync(
  path.join(__dirname, 'weatherAverages.json'),
  JSON.stringify(result, null, 2)
);
console.log(`Generated weather data for ${Object.keys(result.states).length} states`);
