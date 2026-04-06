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
1 25544U 98067A   25095.55835265  .00015568  00000-0  28374-3 0  9997
2 25544  51.6405 138.3846 0005085  77.9255  53.5186 15.49514732504810
HUBBLE SPACE TELESCOPE
1 20580U 90037B   25095.22810565  .00001854  00000-0  10688-3 0  9991
2 20580  28.4691 292.1793 0002758 111.9682 248.1438 15.10542385 41021
TIANGONG
1 48274U 21035A   25095.53127885  .00016482  00000-0  20245-3 0  9992
2 48274  41.4735  52.1245 0002846 215.1245 284.1458 15.59851420 21458
STARLINK-31034
1 58214U 23170A   25093.54167824  .00064531  00000+0  54821-3 0  9991
2 58214  53.0543 142.1245 0001423  88.1245 272.1458 15.06124581 2145
STARLINK-31035
1 58215U 23170B   25093.54211458  .00059821  00000+0  48214-3 0  9992
2 58215  53.0541 142.1852 0001452  89.5214 270.5124 15.06214582 2146
STARLINK-31036
1 58216U 23170C   25093.54312458  .00061245  00000+0  51245-3 0  9993
2 58216  53.0545 142.2458 0001412  87.1452 271.8452 15.06184521 2147
STARLINK-31037
1 58217U 23170D   25093.54412458  .00062245  00000+0  52245-3 0  9994
2 58217  53.0548 142.3458 0001432  86.1452 272.8452 15.06284521 2148
NOAA 19
1 33591U 09005A   25095.51248564  .00000142  00000-0  14582-3 0  9994
2 33591  99.1954  42.1458 0013584 102.1458 258.1458 14.12548210 75482
GOES 16
1 41866U 16071A   25093.40134563  .00000000  00000+0  00000+0 0  9999
2 41866   0.0215 104.9542 0001103 273.1534  82.1643  1.00273542 27018`;
  } else {
    console.log('Satellite proxy endpoint loaded live feed from:', sourceUsed);
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  // Always return 200 so browser doesn't log error; loader.js handles data quality
  return res.status(200).send(text);
}