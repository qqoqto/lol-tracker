import { NextRequest, NextResponse } from 'next/server';
import { getSummonerProfile } from '@/lib/riot-api';
import type { Region } from '@/types/riot';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine') || 'tw2'; // Riot API 要求小寫
  const region = (searchParams.get('region') || 'tw2') as Region;

  if (!gameName) {
    return NextResponse.json(
      { error: 'gameName parameter is required' },
      { status: 400 }
    );
  }

  try {
    const profile = await getSummonerProfile(gameName, tagLine, region);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof Error) {
      // 解析 Riot API 錯誤
      if (error.message.includes('404')) {
        return NextResponse.json(
          { error: '找不到此召喚師' },
          { status: 404 }
        );
      }

      if (error.message.includes('403')) {
        return NextResponse.json(
          { error: 'API Key 無效或已過期' },
          { status: 403 }
        );
      }

      if (error.message.includes('429')) {
        return NextResponse.json(
          { error: 'API 請求次數過多，請稍後再試' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
