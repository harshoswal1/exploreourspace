const SATELLITE_SOURCES = [
  'https://r.jina.ai/http://celestrak.org/NORAD/elements/visual.txt',
  'https://r.jina.ai/http://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle',
  'https://celestrak.org/NORAD/elements/visual.txt',
  'https://celestrak.org/NORAD/elements/stations.txt'
];

const SATELLITE_PROXY_PREFIXES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://corsproxy.io/?'
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
2 20580  28.4707  57.4868 0003271  21.3862  40.4839 15.09242447778696`;

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
      staticPosition: [0.225, 0.175, 0.04],
      staticOrbit: createStaticOrbitPoints(0.22, 51.64, 0),
    },
  },
  {
    name: 'Hubble (Fallback)',
    satrec: {
      staticPosition: [-0.18, 0.2, 0.13],
      staticOrbit: createStaticOrbitPoints(0.24, 28.5, 45),
    },
  },
  {
    name: 'NOAA (Fallback)',
    satrec: {
      staticPosition: [0.08, -0.22, 0.17],
      staticOrbit: createStaticOrbitPoints(0.23, 99.2, 90),
    },
  },
  {
    name: 'Starlink (Fallback)',
    satrec: {
      staticPosition: [-0.14, -0.16, 0.21],
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

async function fetchWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const signal = controller.signal;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { cache: 'no-store', signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function isLikelyTLE(line1, line2) {
  if (!line1 || !line2) return false;
  if (!line1.startsWith('1 ') || !line2.startsWith('2 ')) return false;
  if (line1.length < 20 || line2.length < 20) return false;
  return true;
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

  const normalizedText = normalizeProxyMetadata(text)
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .trim();

  const lines = normalizedText
    .split('\n')
    .map((line) => line.replace(/\uFEFF/g, '').trimEnd())
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

    if (nameLine && line1.startsWith('1 ') && line2.startsWith('2 ')) {
      try {
        if (!satelliteInstance || typeof satelliteInstance.twoline2satrec !== 'function') {
          index += 3;
          continue;
        }

        const satrec = satelliteInstance.twoline2satrec(line1, line2);
        result.push({ name: nameLine, satrec });
      } catch (error) {
        console.warn('TLE invalid, using static position for:', nameLine, error.message);
        // Generate random position around Earth for visibility
        const radius = 1.1; // Just outside Earth surface
        const lat = (Math.random() - 0.5) * Math.PI; // -90 to 90 deg
        const lon = Math.random() * Math.PI * 2; // 0 to 360 deg
        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lon);
        result.push({ name: nameLine, satrec: { staticPosition: [x, y, z], staticOrbit: [] } });
      }
      index += 3;
      continue;
    }

    index += 1;
  }

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
  const candidateSources = ['/api/satellites', ...SATELLITE_SOURCES];
  for (const source of candidateSources) {
    satelliteText = await fetchFromSource(source);
    if (satelliteText) break;
  }

  if (satelliteText) {
    const parsed = parseTLEText(satelliteText, satelliteInstance);
    if (parsed.length > 0) {
      storeSatelliteCache(satelliteText);
      return {
        satellites: parsed,
        status: 'LIVE',
        updatedAt: new Date().toISOString(),
      };
    }
    console.warn('Live satellite text parsed 0 entries');
  }

  const cached = loadSatelliteCache();
  if (cached && cached.text) {
    console.warn('Using last cached satellite data');
    const cachedParsed = parseTLEText(cached.text, satelliteInstance);
    return { satellites: cachedParsed, status: 'CACHED', updatedAt: cached.updatedAt };
  }

  const fallback = parseTLEText(FALLBACK_TLE, satelliteInstance);
  if (fallback.length > 0) {
    return { satellites: fallback, status: 'FALLBACK' };
  }

  console.warn('Fallback TLE data parsing failed; using built-in static satellite placeholders.');
  return {
    satellites: STATIC_SATELLITES.map((sat) => ({
      name: sat.name,
      satrec: sat.satrec,
    })),
    status: 'FALLBACK',
  };
}
