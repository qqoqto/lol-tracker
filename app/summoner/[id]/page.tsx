'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Account, Summoner, LeagueEntry } from '@/types/riot';
import MatchCard from '@/app/components/MatchCard';
import WinRateCircle from '@/app/components/WinRateCircle';
import LPChart from '@/app/components/LPChart';

interface SummonerProfile {
  account: Account;
  summoner: Summoner;
  leagues: LeagueEntry[];
  matchIds: string[];
}

interface GameStats {
  recent20: {
    wins: number;
    losses: number;
    total: number;
    winRate: string;
  };
  champions: Array<{
    championName: string;
    games: number;
    wins: number;
    winRate: string;
    kda: string;
    avgKills: string;
    avgDeaths: string;
    avgAssists: string;
  }>;
  recentChampions: string[];
}

interface LPHistoryPoint {
  gameNumber: number;
  lp: number;
  win: boolean;
  timestamp: number;
  championName: string;
}

export default function SummonerPage() {
  const params = useParams();
  const id = decodeURIComponent(params.id as string);

  const [profile, setProfile] = useState<SummonerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [lpHistory, setLpHistory] = useState<LPHistoryPoint[]>([]);

  // 從 URL 解析 gameName 和 tagLine
  const [gameName, tagLine] = id.split('-');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '查詢失敗');
        }

        const data = await response.json();
        setProfile(data);

        // 獲取統計資訊
        if (data.matchIds && data.matchIds.length > 0) {
          const statsResponse = await fetch('/api/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              matchIds: data.matchIds,
              puuid: data.account.puuid,
            }),
          });

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData);
          }

          // 獲取 LP 歷史（只針對有排位資料的玩家）
          const soloQueue = data.leagues.find((l: LeagueEntry) => l.queueType === 'RANKED_SOLO_5x5');
          if (soloQueue) {
            const lpResponse = await fetch('/api/lp-history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                matchIds: data.matchIds,
                puuid: data.account.puuid,
                currentLP: soloQueue.leaguePoints,
                currentTier: soloQueue.tier,
                currentRank: soloQueue.rank,
              }),
            });

            if (lpResponse.ok) {
              const lpData = await lpResponse.json();
              setLpHistory(lpData.lpHistory || []);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [gameName, tagLine]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-2xl text-white">載入中...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="rounded-lg bg-red-500/20 p-6 text-red-200">
          {error || '無法載入召喚師資料'}
        </div>
      </div>
    );
  }

  const { account, summoner, leagues } = profile;

  // 取得 Solo/Duo 排位資料
  const soloQueue = leagues.find(l => l.queueType === 'RANKED_SOLO_5x5');
  const flexQueue = leagues.find(l => l.queueType === 'RANKED_FLEX_SR');

  // 計算勝率
  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    return total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
  };

  // 段位顏色
  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      IRON: 'text-gray-500',
      BRONZE: 'text-amber-700',
      SILVER: 'text-gray-400',
      GOLD: 'text-yellow-500',
      PLATINUM: 'text-cyan-500',
      EMERALD: 'text-emerald-500',
      DIAMOND: 'text-blue-400',
      MASTER: 'text-purple-500',
      GRANDMASTER: 'text-red-500',
      CHALLENGER: 'text-yellow-300',
    };
    return colors[tier] || 'text-white';
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* 賽季選擇器 */}
        <div className="mb-6 flex items-center gap-2">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            賽季 2025 - Split 1
          </button>
          <button className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-600 hover:text-white transition-colors" disabled>
            歷史賽季（即將推出）
          </button>
        </div>

        {/* 召喚師基本資訊 */}
        <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-lg">
          <div className="flex items-center gap-6">
            {/* 大頭貼 */}
            <div className="relative">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/15.21.1/img/profileicon/${summoner.profileIconId}.png`}
                alt="Profile Icon"
                className="h-24 w-24 rounded-lg border-2 border-gray-600"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-gray-700 px-2 py-1 text-xs text-white">
                {summoner.summonerLevel}
              </div>
            </div>

            {/* 召喚師名稱 */}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {account.gameName}
                <span className="text-gray-500">#{account.tagLine}</span>
              </h1>
              <p className="text-gray-400">等級 {summoner.summonerLevel}</p>
            </div>
          </div>
        </div>

        {/* 最近 20 場統計 */}
        {stats && (
          <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-semibold text-white">
              最近 20 場統計
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* 勝率圓圈 */}
              <div className="flex justify-center">
                <WinRateCircle
                  wins={stats.recent20.wins}
                  losses={stats.recent20.losses}
                />
              </div>

              {/* 常用英雄 */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">常用英雄</h3>
                <div className="space-y-2">
                  {stats.champions.map((champion) => (
                    <div
                      key={champion.championName}
                      className="rounded-lg bg-gray-900 p-3"
                    >
                      <div className="flex items-center gap-3">
                        {/* 英雄圖示 */}
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/15.21.1/img/champion/${champion.championName}.png`}
                          alt={champion.championName}
                          className="h-12 w-12 rounded"
                          onError={(e) => {
                            e.currentTarget.src = `https://ddragon.leagueoflegends.com/cdn/15.21.1/img/profileicon/29.png`;
                          }}
                        />

                        {/* 英雄名稱與場次 */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">
                              {champion.championName}
                            </span>
                            <span className="text-sm text-gray-400">
                              {champion.games} 場
                            </span>
                          </div>

                          {/* KDA 與勝率 */}
                          <div className="mt-1 flex items-center gap-4 text-xs">
                            <div className="text-gray-300">
                              <span className="text-green-400">{champion.avgKills}</span>
                              {' / '}
                              <span className="text-red-400">{champion.avgDeaths}</span>
                              {' / '}
                              <span className="text-yellow-400">{champion.avgAssists}</span>
                            </div>
                            <div className="text-gray-400">
                              KDA <span className="text-white">{champion.kda}</span>
                            </div>
                            <div className={`font-semibold ${
                              parseFloat(champion.winRate) >= 50
                                ? 'text-blue-400'
                                : 'text-red-400'
                            }`}>
                              {champion.winRate}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 最近遊玩英雄 */}
        {stats && stats.recentChampions && stats.recentChampions.length > 0 && (
          <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">
              最近遊玩英雄
            </h2>
            <div className="flex flex-wrap gap-3">
              {stats.recentChampions.map((championName) => (
                <div
                  key={championName}
                  className="group relative"
                  title={championName}
                >
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.21.1/img/champion/${championName}.png`}
                    alt={championName}
                    className="h-16 w-16 rounded-lg border-2 border-gray-700 transition-transform hover:scale-110 hover:border-blue-500"
                    onError={(e) => {
                      e.currentTarget.src = `https://ddragon.leagueoflegends.com/cdn/15.21.1/img/profileicon/29.png`;
                    }}
                  />
                  {/* 英雄名稱提示 */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {championName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LP 變化圖表 */}
        {lpHistory && lpHistory.length > 0 && (
          <div className="mb-8 rounded-lg bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">
              單/雙排位 LP 變化趨勢
            </h2>
            <LPChart data={lpHistory} />
            <div className="mt-4 text-center text-xs text-gray-400">
              * LP 變化為估算值，實際變化會受到 MMR 影響
            </div>
          </div>
        )}

        {/* 排位資訊 */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Solo/Duo Queue */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">
              單/雙排位
            </h2>
            {soloQueue ? (
              <div className="flex items-center gap-6">
                {/* 段位圖示區域 */}
                <div className="flex flex-col items-center">
                  <div className={`text-4xl font-bold ${getTierColor(soloQueue.tier)}`}>
                    {soloQueue.tier}
                  </div>
                  <div className={`text-2xl font-semibold ${getTierColor(soloQueue.tier)}`}>
                    {soloQueue.rank}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    {soloQueue.leaguePoints} LP
                  </div>
                </div>

                {/* 統計資訊 */}
                <div className="flex-1">
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {soloQueue.wins + soloQueue.losses}
                      </span>
                      <span className="text-sm text-gray-400">場</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-400">{soloQueue.wins}勝</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-red-400">{soloQueue.losses}敗</span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>勝率</span>
                      <span className="font-semibold text-white">
                        {calculateWinRate(soloQueue.wins, soloQueue.losses)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${calculateWinRate(soloQueue.wins, soloQueue.losses)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {soloQueue.hotStreak && (
                    <div className="mt-3 inline-block rounded bg-red-500 px-2 py-1 text-xs text-white">
                      🔥 連勝中
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">未定位</div>
            )}
          </div>

          {/* Flex Queue */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">
              彈性排位
            </h2>
            {flexQueue ? (
              <div className="flex items-center gap-6">
                {/* 段位圖示區域 */}
                <div className="flex flex-col items-center">
                  <div className={`text-4xl font-bold ${getTierColor(flexQueue.tier)}`}>
                    {flexQueue.tier}
                  </div>
                  <div className={`text-2xl font-semibold ${getTierColor(flexQueue.tier)}`}>
                    {flexQueue.rank}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    {flexQueue.leaguePoints} LP
                  </div>
                </div>

                {/* 統計資訊 */}
                <div className="flex-1">
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        {flexQueue.wins + flexQueue.losses}
                      </span>
                      <span className="text-sm text-gray-400">場</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-400">{flexQueue.wins}勝</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-red-400">{flexQueue.losses}敗</span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>勝率</span>
                      <span className="font-semibold text-white">
                        {calculateWinRate(flexQueue.wins, flexQueue.losses)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${calculateWinRate(flexQueue.wins, flexQueue.losses)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {flexQueue.hotStreak && (
                    <div className="mt-3 inline-block rounded bg-red-500 px-2 py-1 text-xs text-white">
                      🔥 連勝中
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">未定位</div>
            )}
          </div>
        </div>

        {/* 最近對戰 */}
        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-white">
            最近對戰
          </h2>
          <div>
            {profile.matchIds.length > 0 ? (
              <div className="space-y-3">
                {profile.matchIds.map((matchId) => (
                  <MatchCard
                    key={matchId}
                    matchId={matchId}
                    puuid={account.puuid}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-700 bg-gray-900 p-6 text-center text-gray-400">
                <div className="mb-2 text-lg">📊</div>
                <div className="mb-2 text-white">沒有最近對戰記錄</div>
                <div className="text-sm text-gray-500">
                  Riot API 只保留最近 1-3 個月的對戰記錄
                  <br />
                  如果長時間未遊玩，對戰記錄可能已被清除
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 返回按鈕 */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            返回搜尋
          </a>
        </div>
      </div>
    </div>
  );
}
