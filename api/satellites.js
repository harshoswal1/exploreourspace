export const config = { runtime: 'nodejs' };

const SOURCES = [
  'https://raw.githubusercontent.com/celestrak/NORAD-Elements/main/active.txt'
];

export default async function handler(req, res) {
  let response = null;
  let text = null;
  for (const url of SOURCES) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;

      text = await r.text();

      if (text && text.length > 10000) {
        response = r;
        break;
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }

  if (!response) {
    console.warn('Using minimal fallback data');
    const fallback = `ISS (ZARYA)
1 25544U 98067A   24093.49198941  .00006481  00000+0  12652-3 0  9998
2 25544  51.6427 210.7470 0004318  92.4975  24.0587 15.50350066358655`;
    return res.status(200).send(fallback);
  }

  // cache for 1 hour (important)
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(text);
}