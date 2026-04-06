const SATELLITE_SOURCES = [
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle',
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
  'https://celestrak.org/NORAD/elements/visual.txt',
  'https://celestrak.org/NORAD/elements/stations.txt',
];

const SATELLITE_PROXY_PREFIXES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://proxy.cors.sh/'
];

const SATELLITE_MODULES = [
  'https://esm.sh/satellite.js@4.0.0',
  'https://cdn.skypack.dev/satellite.js',
  'https://cdn.jsdelivr.net/npm/satellite.js@4.0.0/dist/satellite.min.js',
];

function createStaticOrbitPoints(radius, inclinationDeg, longitudeOffsetDeg = 0, count = 90) {
  const inclination = (inclinationDeg * Math.PI) / 180;
  const longitudeOffset = (longitudeOffsetDeg * Math.PI) / 180;
  const points = [];

  for (let i = 0; i < count; i += 1) {
    const theta = (i / count) * Math.PI * 2;
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta) * Math.sin(inclination);
    const z = radius * Math.sin(theta) * Math.cos(inclination);

    const rotatedX = x * Math.cos(longitudeOffset) - z * Math.sin(longitudeOffset);
    const rotatedZ = x * Math.sin(longitudeOffset) + z * Math.cos(longitudeOffset);

    points.push([rotatedX, y, rotatedZ]);
  }

  return points;
}

let satelliteLib = null;

async function loadSatelliteLibrary() {
  if (satelliteLib) return satelliteLib;

  for (const source of SATELLITE_MODULES) {
    try {
      if (source.endsWith('.js') && (source.includes('jsdelivr') || source.includes('unpkg'))) {
        // UMD bundle load into global window.satellite
        if (typeof window !== 'undefined' && !window.satellite) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = source;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load satellite bundle from ${source}`));
            document.head.appendChild(script);
          });
        }
        if (window.satellite && window.satellite.twoline2satrec) {
          satelliteLib = window.satellite;
          break;
        }
      } else {
        const mod = await import(source);
        const candidate = mod.default || mod;
        if (candidate && typeof candidate.twoline2satrec === 'function') {
          if (typeof window !== 'undefined') window.satellite = candidate;
          satelliteLib = candidate;
          break;
        }
      }
    } catch (error) {
      console.warn('Satellite module load failed for', source, error);
    }
  }

  if (!satelliteLib) {
    console.warn('No satellite library could be loaded, falling back to limited TLE parsing (no coordinate cleanup)');
    satelliteLib = {
      twoline2satrec: () => {
        throw new Error('satellite library unavailable');
      },
    };
  }

  return satelliteLib;
}

const SATELLITE_CACHE_KEY = 'space-visualizer-satellite-tle';
const SATELLITE_CACHE_UPDATED_KEY = 'space-visualizer-satellite-tle-updated';

function storeSatelliteCache(text) {
  try {
    localStorage.setItem(SATELLITE_CACHE_KEY, text);
    localStorage.setItem(SATELLITE_CACHE_UPDATED_KEY, new Date().toISOString());
  } catch (error) {
    console.warn('Unable to store satellite cache:', error);
  }
}

function loadSatelliteCache() {
  try {
    const text = localStorage.getItem(SATELLITE_CACHE_KEY);
    const updatedAt = localStorage.getItem(SATELLITE_CACHE_UPDATED_KEY);
    if (!text) return null;
    return { text, updatedAt };
  } catch (error) {
    console.warn('Unable to read satellite cache:', error);
    return null;
  }
}

async function fetchWithTimeout(url, timeoutMs = 25000) {
  const controller = new AbortController();
  const signal = controller.signal;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { 
      mode: 'cors',
      cache: 'no-store', 
      signal, 
      redirect: 'follow'
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function isLikelyTLE(line1, line2) {
  if (!line1 || !line2) return false;
  return /^1\s+\d{5}/.test(line1) && /^2\s+\d{5}/.test(line2);
}

function normalizeProxyMetadata(text) {
  if (!text) return text;
  const marker = 'Markdown Content:';
  const markerIndex = text.indexOf(marker);
  if (markerIndex !== -1) {
    return text.slice(markerIndex + marker.length);
  }
  return text;
}

function parseTLEText(text, satelliteInstance) {
  if (!text) return [];

  // Advanced normalization for mobile browser line-endings
  const normalizedText = normalizeProxyMetadata(text || "")
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ');

  const lines = normalizedText
    .split('\n')
    .map((line) => line.replace(/\uFEFF/g, '').trim())
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (/^(Title|URL Source|Markdown Content):/i.test(trimmed)) return false;
      return true;
    });

  const result = [];
  let index = 0;

  while (index < lines.length - 2) {
    const nameLine = lines[index].trim();
    const line1 = lines[index + 1].trim();
    const line2 = lines[index + 2].trim();

    if (isLikelyTLE(line1, line2)) {
      const satelliteName = nameLine.startsWith('1 ') ? `Unknown satellite ${index}` : nameLine;
      try {
        if (!satelliteInstance || typeof satelliteInstance.twoline2satrec !== 'function') {
          throw new Error('satellite library unavailable');
        }

        const satrec = satelliteInstance.twoline2satrec(line1, line2);
        if (!satrec) throw new Error('Parsing returned null');
        result.push({ name: satelliteName, satrec });
      } catch (error) {
        console.warn('TLE invalid or satellite library unavailable, using static position for:', satelliteName, error.message);
        const radius = 3.4 + Math.random() * 0.4;
        const lat = (Math.random() - 0.5) * Math.PI;
        const lon = Math.random() * Math.PI * 2;
        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lon);
        result.push({ name: satelliteName, satrec: { staticPosition: [x, y, z], staticOrbit: [] } });
      }
      index += 3;
      continue;
    }

    index += 1;
  }

  console.log('Parsed', result.length, 'satellites from TLE data');
  return result.slice(0, 800);
}

export async function loadSatellites() {
  const satelliteInstance = await loadSatelliteLibrary();

  async function tryFetchText(url) {
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        console.warn('Satellite source failed:', url, response.status);
        return null;
      }
      const text = await response.text();
      if (!text || text.trim().length < 50) {
        console.warn('Satellite source returned too little text:', url);
        return null;
      }
      if (/<\/html>|<!doctype|<title>/i.test(text)) {
        console.warn('Satellite source returned HTML instead of TLE text:', url);
        return null;
      }
      return text;
    } catch (error) {
      console.warn('Satellite source error:', url, error);
      return null;
    }
  }

  async function fetchFromSource(source) {
    if (!source) return null;
    if (source.startsWith('/')) {
      return await tryFetchText(source);
    }

    const direct = await tryFetchText(source);
    if (direct) return direct;

    for (const proxyPrefix of SATELLITE_PROXY_PREFIXES) {
      const proxiedUrl = proxyPrefix + encodeURIComponent(source);
      const text = await tryFetchText(proxiedUrl);
      if (text) return text;
    }
    return null;
  }

  let satelliteText = null;
  let parsedData = [];
  const candidateSources = ['/api/satellites', ...SATELLITE_SOURCES];
  
  for (const source of candidateSources) {
    const text = await fetchFromSource(source);
    if (text) {
      const parsed = parseTLEText(text, satelliteInstance);
      // If we got a real dataset (more than the minimal fallback), use it
      if (parsed.length > 10) {
        satelliteText = text;
        parsedData = parsed;
        break;
      }
      console.warn(`Source ${source} returned insufficient data (${parsed.length} sats), skipping...`);
    }
  }

  if (parsedData.length > 0) {
    storeSatelliteCache(satelliteText);
    return {
      satellites: parsedData,
      lib: satelliteInstance,
      status: 'LIVE',
      updatedAt: new Date().toISOString(),
    };
  }

  const cached = loadSatelliteCache();
  if (cached && cached.text) {
    console.warn('Using last cached satellite data');
    const cachedParsed = parseTLEText(cached.text, satelliteInstance);
    return { satellites: cachedParsed, lib: satelliteInstance, status: 'CACHED', updatedAt: cached.updatedAt };
  }

  // If no live data and no cache, return empty system
  console.warn('No live or cached satellite data available. Displaying empty orbital field.');
  return {
    satellites: [],
    lib: satelliteInstance,
    status: 'OFFLINE',
    updatedAt: new Date().toISOString(),
  };
}
