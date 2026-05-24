// netlify/functions/claude.js
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'CLAUDE_API_KEY 환경변수가 설정되지 않았습니다' }),
    };
  }

  let title, summary, categoryLabel, articleContent;
  try {
    ({ title, summary, categoryLabel, articleContent = '' } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: '잘못된 요청 본문' }) };
  }

  const fact1Rule = articleContent
    ? `- 문제 1 (사실): 아래 기사 본문에 실제로 명시된 인물명·수치·기관·날짜·장소를 정답 근거로 사용. 기사를 읽지 않으면 풀 수 없는 문제여야 함. 기사 본문에 없는 내용은 절대 정답으로 사용하지 말 것.`
    : `- 문제 1 (사실): 기사 내용을 정확히 읽었는지 확인하는 문제`;

  const articleSection = articleContent
    ? `\n기사 본문:\n${articleContent}\n`
    : '';

  const prompt = `다음 한국 뉴스 기사를 바탕으로 독해·시사 문제 2개를 만들어 주세요.

카테고리: ${categoryLabel}
기사 제목: ${title}
기사 요약: ${summary}${articleSection}
작성 규칙:
${fact1Rule}
- 문제 2 (시사): 이 기사가 우리 삶·사회에 시사하는 바를 생각하게 하는 문제
- 객관식 4지선다, 정답 1개
- 명확하고 친근한 한국어 사용
- 정답 오답 모두 그럴듯하게 작성

아래 JSON 형식으로만 응답 (코드 블록·부가 설명 없이):
[
  {
    "kind": "사실",
    "text": "질문 내용",
    "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
    "correct": 0,
    "explanation": "해설 (2-3문장)"
  },
  {
    "kind": "시사",
    "text": "질문 내용",
    "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
    "correct": 0,
    "explanation": "해설 (2-3문장)"
  }
]`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data?.error?.message || 'Claude API 오류' }),
      };
    }

    return {
      statusCode: 200,
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
