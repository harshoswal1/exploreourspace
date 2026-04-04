export const config = { runtime: 'nodejs' };

const SOURCES = [
  'https://raw.githubusercontent.com/celestrak/NORAD-Elements/master/active.txt',
  'https://celestrak.org/NORAD/elements/active.txt',
  'https://api.allorigins.win/raw?url=https://celestrak.org/NORAD/elements/active.txt'
];

export default async function handler(req, res) {
  let response = null;
  let text = null;
  for (const url of SOURCES) {
    try {
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      if (r.ok) {
        response = r;
        text = await r.text();
        // Skip if response is too small (likely broken or blocked)
        if (!text || text.length < 500) {
          console.warn('Received incomplete data from', url);
          response = null;
          continue;
        }
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
    return res.status(500).json({ error: 'All sources failed (check logs)' });
  }

  // cache for 1 hour (important)
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(text);
}