import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.RIOT_API_KEY;

  // 測試 API Key 是否載入
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key not found' });
  }

  // 測試多個不同的 API endpoint
  const tests = [];

  // 測試 1: Asia routing (適合 TW/KR/JP)
  try {
    const response1 = await fetch(
      'https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Hide%20on%20bush/KR1',
      { headers: { 'X-Riot-Token': apiKey } }
    );
    tests.push({
      name: 'Asia Routing',
      status: response1.status,
      data: await response1.json(),
    });
  } catch (error) {
    tests.push({
      name: 'Asia Routing',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // 測試 2: SEA routing
  try {
    const response2 = await fetch(
      'https://sea.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Hide%20on%20bush/KR1',
      { headers: { 'X-Riot-Token': apiKey } }
    );
    tests.push({
      name: 'SEA Routing',
      status: response2.status,
      data: await response2.json(),
    });
  } catch (error) {
    tests.push({
      name: 'SEA Routing',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // 測試 3: TW2 平台 API
  try {
    const response3 = await fetch(
      'https://tw2.api.riotgames.com/lol/platform/v3/champion-rotations',
      { headers: { 'X-Riot-Token': apiKey } }
    );
    tests.push({
      name: 'TW2 Platform API',
      status: response3.status,
      data: await response3.json(),
    });
  } catch (error) {
    tests.push({
      name: 'TW2 Platform API',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return NextResponse.json({
    apiKeyLoaded: !!apiKey,
    apiKeyPrefix: apiKey.substring(0, 10) + '...',
    tests,
  });
}
