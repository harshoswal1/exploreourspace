export const config = { runtime: 'nodejs' };

const SOURCES = [
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle',
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
  'https://celestrak.org/NORAD/elements/visual.txt',
  'https://celestrak.org/NORAD/elements/stations.txt',
];

function isPlainTextTLE(text) {
  if (!text) return false;
  const sample = text.slice(0, 640);
  if (/<\/html>|<!doctype|<title>/i.test(sample)) return false;
  return /1\s+\d{5}.*\n2\s+\d{5}/s.test(sample);
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
    console.warn('Using minimal fallback data');
    text = `ISS (ZARYA)
1 25544U 98067A   24093.49198941  .00006481  00000+0  12652-3 0  9998
2 25544  51.6427 210.7470 0004318  92.4975  24.0587 15.50350066358655
HUBBLE SPACE TELESCOPE
1 20580U 90037B   24093.54780934  .00001142  00000+0  63548-4 0  9994
2 20580  28.4707  57.4868 0003271  21.3862  40.4839 15.09242447778696
TIANGONG
1 48274U 21035A   24093.52838507  .00015563  00000+0  19194-3 0  9996
2 48274  41.4745 166.3881 0003052 227.1432 249.2319 15.59754707166885`;
  } else {
    console.log('Satellite proxy endpoint loaded live feed from:', sourceUsed);
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(text);
}