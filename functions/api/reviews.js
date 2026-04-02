export async function onRequestGet(context) {
  const { env } = context;

  if (!env.GOOGLE_PLACES_API_KEY || !env.GOOGLE_PLACE_ID) {
    return new Response(JSON.stringify({ error: 'Google API not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${env.GOOGLE_PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${env.GOOGLE_PLACES_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Google API error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();

    if (data.status !== 'OK') {
      return new Response(JSON.stringify({ error: data.status }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const reviews = (data.result.reviews || []).filter(r => r.rating >= 5);

    return new Response(JSON.stringify({
      reviews,
      rating: data.result.rating,
      total: data.result.user_ratings_total,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
