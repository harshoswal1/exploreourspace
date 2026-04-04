const NASA_API_KEY = "Gaf59Z6jhmdbyTYDabXcKrK6h9YIuD12U4YKiNA6";
const ENABLE_ASTEROID_FALLBACK = true; // set to true to use hardcoded asteroid fallback data
const MAX_ASTEROIDS = 12;

const FALLBACK_ASTEROIDS = [
  {
    id: '2000433',
    name: '433 Eros (A898 PA)',
    hazardous: false,
    absoluteMagnitude: 10.4,
    diameterMinKm: 22.21,
    diameterMaxKm: 49.66,
    closeApproachDate: '1900-Dec-27 01:30',
    relativeVelocityKph: 20083,
    missDistanceKm: 47112732.928,
    missDistanceLunar: 122.51,
    nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=433',
    index: 0,
  },
  {
    id: '1036',
    name: '1036 Ganymed',
    hazardous: false,
    absoluteMagnitude: 9.45,
    diameterMinKm: 31.66,
    diameterMaxKm: 70.78,
    closeApproachDate: '2026-Apr-15 09:12',
    relativeVelocityKph: 34491,
    missDistanceKm: 56241000,
    missDistanceLunar: 146.23,
    nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1036',
    index: 1,
  },
  {
    id: '1620',
    name: '1620 Geographos',
    hazardous: true,
    absoluteMagnitude: 15.2,
    diameterMinKm: 2.5,
    diameterMaxKm: 5.1,
    closeApproachDate: '2026-May-03 17:40',
    relativeVelocityKph: 28240,
    missDistanceKm: 13860000,
    missDistanceLunar: 36.05,
    nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1620',
    index: 2,
  },
  {
    id: '1866',
    name: '1866 Sisyphus',
    hazardous: true,
    absoluteMagnitude: 12.5,
    diameterMinKm: 8.5,
    diameterMaxKm: 18.9,
    closeApproachDate: '2026-Jun-17 04:25',
    relativeVelocityKph: 24510,
    missDistanceKm: 24780000,
    missDistanceLunar: 64.47,
    nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1866',
    index: 3,
  },
  {
    id: '1981',
    name: '1981 Midas',
    hazardous: true,
    absoluteMagnitude: 15.3,
    diameterMinKm: 2.0,
    diameterMaxKm: 4.4,
    closeApproachDate: '2026-Jul-09 11:08',
    relativeVelocityKph: 31520,
    missDistanceKm: 14630000,
    missDistanceLunar: 38.07,
    nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1981',
    index: 4,
  },
];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function scoreAsteroid(asteroid) {
  const diameter =
    asteroid.estimated_diameter.kilometers.estimated_diameter_max || 0;
  const hazardousBoost = asteroid.is_potentially_hazardous_asteroid ? 2.5 : 1;
  const closeApproach = asteroid.close_approach_data?.[0];
  const missKm = closeApproach ? Number(closeApproach.miss_distance.kilometers) : Infinity;
  const proximityBoost = Number.isFinite(missKm) ? 1 / Math.max(missKm / 100000, 1) : 0;

  return diameter * hazardousBoost + proximityBoost;
}

export async function loadMajorAsteroids() {
  if (!NASA_API_KEY || NASA_API_KEY === 'DEMO_KEY') {
    if (!ENABLE_ASTEROID_FALLBACK) {
      console.error('No NASA API key configured and asteroid fallback is disabled. Asteroid list is empty.');
      return [];
    }
    console.warn('Using fallback asteroid data because no dedicated NASA API key is configured.');
    return FALLBACK_ASTEROIDS;
  }

  const today = new Date();
  const startDate = formatDate(today);
  const endDate = formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000));
  const browseUrl = `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${NASA_API_KEY}`;
  const feedUrl =
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}` +
    `&end_date=${endDate}&api_key=${NASA_API_KEY}`;

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Asteroid request failed with status ${response.status}`);
    }
    return response.json();
  }

  function normalizeObjects(objects) {
    return objects
      .filter((asteroid) => asteroid.close_approach_data?.length)
      .sort((a, b) => scoreAsteroid(b) - scoreAsteroid(a))
      .slice(0, MAX_ASTEROIDS)
      .map((asteroid, index) => {
        const approach = asteroid.close_approach_data[0];
        const diameterMin =
          asteroid.estimated_diameter.kilometers.estimated_diameter_min || 0;
        const diameterMax =
          asteroid.estimated_diameter.kilometers.estimated_diameter_max || 0;

        return {
          id: asteroid.id,
          name: asteroid.name,
          hazardous: asteroid.is_potentially_hazardous_asteroid,
          absoluteMagnitude: asteroid.absolute_magnitude_h,
          diameterMinKm: diameterMin,
          diameterMaxKm: diameterMax,
          closeApproachDate: approach.close_approach_date_full || approach.close_approach_date,
          relativeVelocityKph: Number(approach.relative_velocity.kilometers_per_hour),
          missDistanceKm: Number(approach.miss_distance.kilometers),
          missDistanceLunar: Number(approach.miss_distance.lunar),
          nasaJplUrl: asteroid.nasa_jpl_url,
          index,
        };
      });
  }

  try {
    const browseJson = await fetchJson(browseUrl);
    const normalizedBrowse = normalizeObjects(browseJson.near_earth_objects || []);
    if (normalizedBrowse.length > 0) {
      return normalizedBrowse;
    }
  } catch (error) {
    console.error('Primary asteroid browse failed:', error);
  }

  try {
    const feedJson = await fetchJson(feedUrl);
    const feedObjects = Object.values(feedJson.near_earth_objects || {}).flat();
    return normalizeObjects(feedObjects);
  } catch (error) {
    console.error('Fallback asteroid feed failed:', error);
    return FALLBACK_ASTEROIDS;
  }
}
