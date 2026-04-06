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

let FALLBACK_TLE = `ISS (ZARYA)
1 25544U 98067A   24093.49198941  .00006481  00000+0  12652-3 0  9998
2 25544  51.6427 210.7470 0004318  92.4975  24.0587 15.50350066358655
HUBBLE SPACE TELESCOPE
1 20580U 90037B   24093.54780934  .00001142  00000+0  63548-4 0  9994
2 20580  28.4707  57.4868 0003271  21.3862  40.4839 15.09242447778696
TIANGONG
1 48274U 21035A   24093.52838507  .00015563  00000+0  19194-3 0  9996
2 48274  41.4745 166.3881 0003052 227.1432 249.2319 15.59754707166885
STARLINK-31034
1 58214U 23170A   24093.54167824  .00064531  00000+0  54821-3 0  9991
2 58214  53.0543 142.1245 0001423  88.1245 272.1458 15.06124581 2145
STARLINK-31035
1 58215U 23170B   24093.54211458  .00059821  00000+0  48214-3 0  9992
2 58215  53.0541 142.1852 0001452  89.5214 270.5124 15.06214582 2146
STARLINK-31036
1 58216U 23170C   24093.54312458  .00061245  00000+0  51245-3 0  9993
2 58216  53.0545 142.2458 0001412  87.1452 271.8452 15.06184521 2147
NOAA 19
1 33591U 09005A   24093.54576352  .00000085  00000+0  86196-4 0  9990
2 33591  99.1983 133.4357 0013898 107.4101 252.8550 14.12502621783457
GOES 16
1 41866U 16071A   24093.40134563  .00000000  00000+0  00000+0 0  9999
2 41866   0.0215 104.9542 0001103 273.1534  82.1643  1.00273542 27018`;

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

const STATIC_SATELLITES = [
  {
    name: 'ISS (Fallback)',
    satrec: {
      staticPosition: [2.8, 2.1, 0.6],
      staticOrbit: createStaticOrbitPoints(0.22, 51.64, 0),
    },
  },
  {
    name: 'Hubble (Fallback)',
    satrec: {
      staticPosition: [-2.5, 2.6, 1.2],
      staticOrbit: createStaticOrbitPoints(0.24, 28.5, 45),
    },
  },
  {
    name: 'NOAA (Fallback)',
    satrec: {
      staticPosition: [1.2, -3.2, 1.8],
      staticOrbit: createStaticOrbitPoints(0.23, 99.2, 90),
    },
  },
  {
    name: 'Starlink (Fallback)',
    satrec: {
      staticPosition: [-2.0, -2.5, 2.5],
      staticOrbit: createStaticOrbitPoints(0.2, 53.0, 120),
    },
  },
];

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

  const fallback = parseTLEText(FALLBACK_TLE, satelliteInstance);
  if (fallback.length > 0) {
    return { satellites: fallback, lib: satelliteInstance, status: 'FALLBACK' };
  }

  console.warn('Fallback TLE data parsing failed; using built-in static satellite placeholders.');
  return {
    satellites: STATIC_SATELLITES.map((sat) => ({
      name: sat.name,
      satrec: sat.satrec,
    })),
    lib: satelliteInstance,
    status: 'FALLBACK',
  };
}
