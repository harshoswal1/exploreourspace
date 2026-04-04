export const config = { runtime: 'nodejs' };

const SOURCES = [
  'https://raw.githubusercontent.com/celestrak/NORAD-Elements/master/active.txt'
];

export default async function handler(req, res) {
  let response = null;
  let text = null;
  for (const url of SOURCES) {
    try {
      const r = await fetch(url);
      if (r.ok) {
        response = r;
        text = await r.text();
        break;
      } else {
        const errorText = await r.text();
        console.error('Celestrak fetch failed:', r.status, errorText, 'for', url);
      }
    } catch (err) {
      console.error('Fetch error for', url, err);
    }
  }

  if (!response) {
    console.warn('All sources failed, returning minimal fallback');
    const fallback = `ISS (ZARYA)
1 25544U 98067A   24093.49198941  .00006481  00000+0  12652-3 0  9998
2 25544  51.6427 210.7470 0004318  92.4975  24.0587 15.50350066358655`;
    return res.status(200).send(fallback);
  }

  // cache for 1 hour (important)
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.status(200).send(text);
}