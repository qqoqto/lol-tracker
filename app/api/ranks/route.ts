import { NextRequest, NextResponse } from 'next/server';
import { getLeagueEntries } from '@/lib/riot-api';
import type { Region } from '@/types/riot';

// 批量查詢玩家排位資訊
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { puuids, region = 'tw2' } = body as { puuids: string[], region?: Region };

    if (!puuids || !Array.isArray(puuids)) {
      return NextResponse.json(
        { error: 'puuids array is required' },
        { status: 400 }
      );
    }

    // 批量查詢每個玩家的排位
    const ranksPromises = puuids.map(async (puuid) => {
      try {
        const leagues = await getLeagueEntries(puuid, region);
        // 只返回單排的排位資訊
        const soloQueue = leagues.find(l => l.queueType === 'RANKED_SOLO_5x5');
        return {
          puuid,
          rank: soloQueue ? {
            tier: soloQueue.tier,
            rank: soloQueue.rank,
            leaguePoints: soloQueue.leaguePoints,
          } : null,
        };
      } catch (error) {
        // 如果查詢失敗，返回 null
        return {
          puuid,
          rank: null,
        };
      }
    });

    const ranks = await Promise.all(ranksPromises);

    return NextResponse.json({ ranks });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
