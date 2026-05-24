// netlify/functions/fetch-article.js
export async function handler(event) {
  const url = event.queryStringParameters?.url;
  if (!url) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' }),
    };
  }

  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: 'text/plain' },
      signal: AbortSignal.timeout(10000),
    });
    const text = await res.text();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ content: text.substring(0, 3000) }),
    };
  } catch {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ content: '' }),
    };
  }
}
