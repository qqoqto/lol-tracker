import { NextRequest, NextResponse } from 'next/server';
import { getMatchById } from '@/lib/riot-api';
import type { Region } from '@/types/riot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchIds, puuid, region = 'tw2' } = body as {
      matchIds: string[],
      puuid: string,
      region?: Region
    };

    if (!matchIds || !Array.isArray(matchIds) || !puuid) {
      return NextResponse.json(
        { error: 'matchIds array and puuid are required' },
        { status: 400 }
      );
    }

    // 批量獲取對戰詳細資料
    const matchesPromises = matchIds.slice(0, 20).map(async (matchId) => {
      try {
        const match = await getMatchById(matchId, region);
        return match;
      } catch (error) {
        return null;
      }
    });

    const matches = (await Promise.all(matchesPromises)).filter(m => m !== null);

    // 統計數據
    let wins = 0;
    let losses = 0;
    const championStats: Record<string, {
      championName: string;
      games: number;
      wins: number;
      kills: number;
      deaths: number;
      assists: number;
    }> = {};
    const recentChampions: string[] = [];

    matches.forEach(match => {
      if (!match) return;

      const player = match.info.participants.find(p => p.puuid === puuid);
      if (!player) return;

      // 勝敗統計
      if (player.win) {
        wins++;
      } else {
        losses++;
      }

      // 追蹤最近使用的英雄（不重複）
      if (!recentChampions.includes(player.championName)) {
        recentChampions.push(player.championName);
      }

      // 英雄統計
      const champKey = player.championName;
      if (!championStats[champKey]) {
        championStats[champKey] = {
          championName: player.championName,
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
        };
      }

      championStats[champKey].games++;
      if (player.win) championStats[champKey].wins++;
      championStats[champKey].kills += player.kills;
      championStats[champKey].deaths += player.deaths;
      championStats[champKey].assists += player.assists;
    });

    // 轉換為陣列並排序
    const championList = Object.values(championStats)
      .sort((a, b) => b.games - a.games)
      .slice(0, 5) // 只取前 5 個常用英雄
      .map(champ => ({
        ...champ,
        winRate: champ.games > 0 ? ((champ.wins / champ.games) * 100).toFixed(1) : '0.0',
        kda: champ.deaths > 0
          ? (((champ.kills + champ.assists) / champ.deaths)).toFixed(2)
          : ((champ.kills + champ.assists)).toFixed(2),
        avgKills: (champ.kills / champ.games).toFixed(1),
        avgDeaths: (champ.deaths / champ.games).toFixed(1),
        avgAssists: (champ.assists / champ.games).toFixed(1),
      }));

    return NextResponse.json({
      recent20: {
        wins,
        losses,
        total: wins + losses,
        winRate: wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : '0.0',
      },
      champions: championList,
      recentChampions: recentChampions.slice(0, 10), // 最近 10 個不重複的英雄
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
