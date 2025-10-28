import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '..', 'demo_data', 'owid-co2-data.csv');
const outputDir = path.join(__dirname, '..', 'public', 'data', 'co2');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Reading CSV file...');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

console.log(`Loaded ${records.length} records`);

// Filter major countries and recent years
const MAJOR_COUNTRIES = ['USA', 'CHN', 'IND', 'RUS', 'JPN', 'DEU', 'GBR', 'FRA', 'ITA', 'BRA', 'CAN', 'KOR', 'MEX', 'AUS', 'ESP'];
const START_YEAR = 1950;

// 1. Global summary by year (all countries aggregated)
console.log('Creating global summary...');
const globalByYear = {};

records.forEach((row) => {
  const year = parseInt(row.year);
  if (year < START_YEAR || !row.co2 || row.co2 === '') return;

  if (!globalByYear[year]) {
    globalByYear[year] = {
      year,
      total_co2: 0,
      total_coal: 0,
      total_gas: 0,
      total_oil: 0,
      total_cement: 0,
      countries_count: 0,
    };
  }

  const co2 = parseFloat(row.co2) || 0;
  const coal = parseFloat(row.coal_co2) || 0;
  const gas = parseFloat(row.gas_co2) || 0;
  const oil = parseFloat(row.oil_co2) || 0;
  const cement = parseFloat(row.cement_co2) || 0;

  if (co2 > 0) {
    globalByYear[year].total_co2 += co2;
    globalByYear[year].total_coal += coal;
    globalByYear[year].total_gas += gas;
    globalByYear[year].total_oil += oil;
    globalByYear[year].total_cement += cement;
    globalByYear[year].countries_count++;
  }
});

const globalSummary = Object.values(globalByYear).sort((a, b) => a.year - b.year);
fs.writeFileSync(
  path.join(outputDir, 'global-summary.json'),
  JSON.stringify(globalSummary, null, 2)
);
console.log(`✓ Created global-summary.json (${globalSummary.length} years)`);

// 2. Top emitters by year (top 15 countries per year)
console.log('Creating top emitters data...');
const topEmittersByYear = {};

records.forEach((row) => {
  const year = parseInt(row.year);
  if (year < START_YEAR || !row.co2 || row.co2 === '' || parseFloat(row.co2) <= 0) return;

  if (!topEmittersByYear[year]) {
    topEmittersByYear[year] = [];
  }

  topEmittersByYear[year].push({
    country: row.country,
    iso_code: row.iso_code,
    co2: parseFloat(row.co2),
    co2_per_capita: row.co2_per_capita ? parseFloat(row.co2_per_capita) : 0,
    population: row.population ? parseFloat(row.population) : 0,
  });
});

// Keep only top 15 per year and save
const topEmittersData = {};
Object.keys(topEmittersByYear).forEach((year) => {
  const sorted = topEmittersByYear[year]
    .sort((a, b) => b.co2 - a.co2)
    .slice(0, 15);
  topEmittersData[year] = sorted;
});

fs.writeFileSync(
  path.join(outputDir, 'top-emitters.json'),
  JSON.stringify(topEmittersData, null, 2)
);
console.log(`✓ Created top-emitters.json (${Object.keys(topEmittersData).length} years)`);

// 3. Country details (one file per major country)
console.log('Creating country detail files...');
const countryData = {};

records.forEach((row) => {
  const year = parseInt(row.year);
  if (year < START_YEAR) return;
  if (!MAJOR_COUNTRIES.includes(row.iso_code)) return;

  if (!countryData[row.iso_code]) {
    countryData[row.iso_code] = {
      country: row.country,
      iso_code: row.iso_code,
      data: [],
    };
  }

  const dataPoint = {
    year,
    co2: row.co2 ? parseFloat(row.co2) : 0,
    co2_per_capita: row.co2_per_capita ? parseFloat(row.co2_per_capita) : 0,
    coal_co2: row.coal_co2 ? parseFloat(row.coal_co2) : 0,
    gas_co2: row.gas_co2 ? parseFloat(row.gas_co2) : 0,
    oil_co2: row.oil_co2 ? parseFloat(row.oil_co2) : 0,
    cement_co2: row.cement_co2 ? parseFloat(row.cement_co2) : 0,
    cumulative_co2: row.cumulative_co2 ? parseFloat(row.cumulative_co2) : 0,
    population: row.population ? parseFloat(row.population) : 0,
    gdp: row.gdp ? parseFloat(row.gdp) : 0,
  };

  countryData[row.iso_code].data.push(dataPoint);
});

Object.keys(countryData).forEach((isoCode) => {
  const data = countryData[isoCode];
  data.data.sort((a, b) => a.year - b.year);

  fs.writeFileSync(
    path.join(outputDir, `country-${isoCode}.json`),
    JSON.stringify(data, null, 2)
  );
});
console.log(`✓ Created ${Object.keys(countryData).length} country detail files`);

// 4. Countries list with latest stats
console.log('Creating countries list...');
const latestYear = Math.max(...Object.keys(globalByYear).map(Number));
const countriesList = [];

const latestByCountry = {};
records.forEach((row) => {
  const year = parseInt(row.year);
  if (year === latestYear && row.co2 && parseFloat(row.co2) > 0) {
    latestByCountry[row.iso_code] = {
      country: row.country,
      iso_code: row.iso_code,
      co2: parseFloat(row.co2),
      co2_per_capita: row.co2_per_capita ? parseFloat(row.co2_per_capita) : 0,
      population: row.population ? parseFloat(row.population) : 0,
      year: latestYear,
    };
  }
});

const sortedCountries = Object.values(latestByCountry)
  .sort((a, b) => b.co2 - a.co2)
  .slice(0, 50);

fs.writeFileSync(
  path.join(outputDir, 'countries-list.json'),
  JSON.stringify({ year: latestYear, countries: sortedCountries }, null, 2)
);
console.log(`✓ Created countries-list.json (top 50 countries for ${latestYear})`);

// 5. Regional aggregation
console.log('Creating regional data...');
const REGIONS = {
  'North America': ['USA', 'CAN', 'MEX'],
  'Europe': ['DEU', 'GBR', 'FRA', 'ITA', 'ESP', 'POL', 'NLD', 'BEL', 'UKR'],
  'Asia': ['CHN', 'IND', 'JPN', 'KOR', 'IDN', 'THA', 'VNM', 'PAK', 'BGD'],
  'South America': ['BRA', 'ARG', 'CHL', 'COL', 'PER'],
  'Middle East': ['SAU', 'IRN', 'TUR', 'ARE', 'IRQ'],
  'Africa': ['ZAF', 'EGY', 'NGA', 'DZA', 'MAR'],
  'Oceania': ['AUS', 'NZL'],
};

const regionalByYear = {};

records.forEach((row) => {
  const year = parseInt(row.year);
  if (year < START_YEAR || !row.co2 || row.co2 === '') return;

  // Find region
  let region = 'Other';
  for (const [regionName, countries] of Object.entries(REGIONS)) {
    if (countries.includes(row.iso_code)) {
      region = regionName;
      break;
    }
  }

  if (!regionalByYear[year]) {
    regionalByYear[year] = { year };
  }

  if (!regionalByYear[year][region]) {
    regionalByYear[year][region] = 0;
  }

  regionalByYear[year][region] += parseFloat(row.co2) || 0;
});

const regionalData = Object.values(regionalByYear).sort((a, b) => a.year - b.year);
fs.writeFileSync(
  path.join(outputDir, 'regional-summary.json'),
  JSON.stringify(regionalData, null, 2)
);
console.log(`✓ Created regional-summary.json (${regionalData.length} years)`);

console.log('\n✅ Data aggregation complete!');
console.log(`Output directory: ${outputDir}`);
console.log('\nGenerated files:');
console.log('  - global-summary.json (global trends)');
console.log('  - top-emitters.json (top 15 per year)');
console.log('  - regional-summary.json (by region)');
console.log('  - countries-list.json (top 50 current)');
console.log(`  - ${Object.keys(countryData).length} country-*.json files (detailed data)`);
