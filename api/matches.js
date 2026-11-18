
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.CRICKET_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'CRICKET_API_KEY is missing in Vercel' });
  }

  try {
    const url = new URL('https://api.cricapi.com/v1/currentMatches');
    url.searchParams.set('apikey', key);
    url.searchParams.set('offset', '0');

    const upstream = await fetch(url);
    const body = await upstream.json();

    if (!upstream.ok || body.status !== 'success') {
      return res.status(502).json({ error: body.reason || 'Cricket API error' });
    }

    return res.status(200).json({
      data: Array.isArray(body.data) ? body.data : [],
      info: body.info || {}
    });
  } catch (error) {
    return res.status(502).json({ error: 'Could not connect to Cricket API' });
  }
};
