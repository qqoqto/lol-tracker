import { NextRequest, NextResponse } from 'next/server';
import { getMatchById } from '@/lib/riot-api';
import type { Region } from '@/types/riot';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const region = (searchParams.get('region') || 'tw2') as Region;

  if (!matchId) {
    return NextResponse.json(
      { error: 'matchId parameter is required' },
      { status: 400 }
    );
  }

  try {
    const match = await getMatchById(matchId, region);
    return NextResponse.json(match);
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('404')) {
        return NextResponse.json(
          { error: '找不到此對戰記錄' },
          { status: 404 }
        );
      }

      if (error.message.includes('403')) {
        return NextResponse.json(
          { error: 'API Key 無效或已過期' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
