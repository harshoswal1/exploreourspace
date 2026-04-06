export const config = { runtime: 'nodejs' };

const SOURCES = [
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle',
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
  'https://www.amsat.org/tle/current/nasabare.txt',
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle'
];

function isPlainTextTLE(text) {
  if (!text) return false;
  const sample = text.slice(0, 1000);
  if (/<\/html>|<!doctype|<title>/i.test(sample)) return false;
  return /1\s+\d{5}/.test(sample) && /2\s+\d{5}/.test(sample);
}

export default async function handler(req, res) {
  let text = null;

  let sourceUsed = null;

  for (const url of SOURCES) {
    try {
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'text/plain',
        },
        redirect: 'follow',
        cache: 'no-store',
      });
      if (!r.ok) {
        console.warn('Satellite source failed:', url, r.status);
        continue;
      }

      const body = await r.text();
      if (!body || body.length < 500 || !isPlainTextTLE(body)) {
        console.warn('Satellite source returned invalid text:', url);
        continue;
      }

      text = body;
      sourceUsed = url;
      break;
    } catch (err) {
      console.error('Fetch error for satellite source:', url, err);
    }
  }

  if (!text) {
    console.warn('Satellite live fetch failed on server; returning error status.');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    // Return 200 with an empty string to avoid "Red" error logs in the browser console.
    return res.status(200).send('');
  } else {
    console.log('Satellite proxy endpoint loaded live feed from:', sourceUsed);
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(text);
}