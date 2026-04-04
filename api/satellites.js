export default async function handler(req, res) {
  try {
    const response = await fetch(
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
  {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  }
);
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch satellites' });
    }

    const text = await response.text();

    // cache for 1 hour (important)
    res.setHeader('Cache-Control', 's-maxage=3600');

    res.status(200).send(text);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}