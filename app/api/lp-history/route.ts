import { NextRequest, NextResponse } from 'next/server';
import { getMatchById } from '@/lib/riot-api';
import type { Region } from '@/types/riot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchIds, puuid, currentLP, currentTier, currentRank, region = 'tw2' } = body as {
      matchIds: string[],
      puuid: string,
      currentLP: number,
      currentTier: string,
      currentRank: string,
      region?: Region
    };

    if (!matchIds || !Array.isArray(matchIds) || !puuid) {
      return NextResponse.json(
        { error: 'matchIds array and puuid are required' },
        { status: 400 }
      );
    }

    // 批量獲取排位對戰詳細資料
    const matchesPromises = matchIds.slice(0, 20).map(async (matchId) => {
      try {
        const match = await getMatchById(matchId, region);
        // 只保留排位賽（單/雙排位）
        if (match.info.queueId === 420) {
          return match;
        }
        return null;
      } catch (error) {
        return null;
      }
    });

    const matches = (await Promise.all(matchesPromises)).filter(m => m !== null);

    if (matches.length === 0) {
      return NextResponse.json({ lpHistory: [] });
    }

    // 按時間排序（從舊到新）
    matches.sort((a, b) => a!.info.gameEndTimestamp - b!.info.gameEndTimestamp);

    // 計算 LP 變化
    // 假設：勝利 +20 LP，失敗 -15 LP（這是估算，實際 LP 變化會根據 MMR 調整）
    const lpHistory: Array<{
      gameNumber: number;
      lp: number;
      win: boolean;
      timestamp: number;
      championName: string;
    }> = [];

    let currentEstimatedLP = currentLP;

    // 從最新的對戰往回推算
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i]!;
      const player = match.info.participants.find(p => p.puuid === puuid);

      if (!player) continue;

      lpHistory.unshift({
        gameNumber: i + 1,
        lp: currentEstimatedLP,
        win: player.win,
        timestamp: match.info.gameEndTimestamp,
        championName: player.championName,
      });

      // 往前推算上一場的 LP（反向計算）
      if (player.win) {
        // 如果這場贏了，上一場的 LP 應該更少
        currentEstimatedLP -= 20;
      } else {
        // 如果這場輸了，上一場的 LP 應該更多
        currentEstimatedLP += 15;
      }
    }

    // 確保 LP 不會是負數（如果是負數，表示可能掉段了）
    const minLP = Math.min(...lpHistory.map(h => h.lp));
    if (minLP < 0) {
      lpHistory.forEach(h => h.lp -= minLP);
    }

    return NextResponse.json({ lpHistory });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
