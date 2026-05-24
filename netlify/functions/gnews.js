// netlify/functions/gnews.js
export async function handler(event) {
  const category = event.queryStringParameters?.category || 'general';
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GNEWS_API_KEY 환경변수가 설정되지 않았습니다' }),
    };
  }

  const url = `https://gnews.io/api/v4/top-headlines?country=kr&lang=ko&category=${category}&token=${apiKey}&max=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
}
