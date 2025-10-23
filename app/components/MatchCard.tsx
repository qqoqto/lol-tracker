'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Match, MatchParticipant } from '@/types/riot';

interface MatchCardProps {
  matchId: string;
  puuid: string;
}

// 遊戲模式對應
const QUEUE_NAMES: Record<number, string> = {
  // 排位模式
  420: '單/雙排位',
  440: '彈性排位',

  // 一般模式
  400: '一般選角',
  430: '一般盲選',
  490: '快速對戰',

  // ARAM
  450: 'ARAM',
  720: 'ARAM 衝突',

  // 特殊模式
  700: '召喚峽谷衝突',
  1300: '極限閃擊',
  1400: '絕對武力',
  1700: '鬥魂競技場',
  1710: '鬥魂競技場 (排位)',
  1900: 'URF',

  // 輪替模式
  900: '無限火力',
  910: '飛升模式',
  920: '魄羅王',
  950: '末日人機',
  1020: '單一英雄',

  // 人機模式
  870: '新手人機',
  880: '簡單人機',
  890: '一般人機',

  // Swarm 模式
  1810: 'Swarm (單人)',
  1820: 'Swarm (雙人)',
  1830: 'Swarm (三人)',
  1840: 'Swarm (四人)',

  // 雲頂之弈
  1090: '雲頂之弈',
  1100: '雲頂之弈 (排位)',
  1130: '雲頂之弈 (超高速)',
  1160: '雲頂之弈 (雙人)',

  // 教學模式
  2000: '教學 1',
  2010: '教學 2',
  2020: '教學 3',
};

// 取得牌位顏色
function getTierColor(tier: string): string {
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
  return colors[tier] || 'text-gray-400';
}

// 取得牌位簡稱
function getTierShort(tier: string, rank: string): string {
  const tierMap: Record<string, string> = {
    IRON: '鐵',
    BRONZE: '銅',
    SILVER: '銀',
    GOLD: '金',
    PLATINUM: '白金',
    EMERALD: '翡翠',
    DIAMOND: '鑽石',
    MASTER: '大師',
    GRANDMASTER: '宗師',
    CHALLENGER: '菁英',
  };
  const tierName = tierMap[tier] || tier;

  // 大師以上沒有段位
  if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier)) {
    return tierName;
  }

  return `${tierName}${rank}`;
}

// 召喚師技能 ID 對應圖示名稱
function getSummonerSpellIcon(spellId: number): string {
  const spellMap: Record<number, string> = {
    1: 'SummonerBoost',          // 淨化
    3: 'SummonerExhaust',        // 虛弱
    4: 'SummonerFlash',          // 閃現
    6: 'SummonerHaste',          // 幽靈疾步
    7: 'SummonerHeal',           // 治療
    11: 'SummonerSmite',         // 懲戒
    12: 'SummonerTeleport',      // 傳送
    13: 'SummonerMana',          // 清晰
    14: 'SummonerDot',           // 點燃
    21: 'SummonerBarrier',       // 屏障
    30: 'SummonerPoroRecall',    // 魄羅召喚
    31: 'SummonerPoroThrow',     // 魄羅投擲
    32: 'SummonerSnowball',      // 雪球
    39: 'SummonerSnowURFSnowball_Mark', // URF 雪球
    54: 'Summoner_UltBookPlaceholder',  // 替補
    55: 'Summoner_UltBookSmitePlaceholder', // 替補懲戒
  };
  return spellMap[spellId] || 'SummonerFlash';
}

// 符文圖示路徑
function getRuneIcon(runeId: number): string {
  return `perk-images/Styles/${getRunePath(runeId)}/${runeId}.png`;
}

// 符文系統圖示
function getRuneStyleIcon(styleId: number): string {
  const styleMap: Record<number, string> = {
    8000: 'perk-images/Styles/7200_Domination.png',      // 主宰
    8100: 'perk-images/Styles/7201_Precision.png',       // 精密
    8200: 'perk-images/Styles/7202_Sorcery.png',         // 巫術
    8300: 'perk-images/Styles/7203_Whimsy.png',          // 啟發
    8400: 'perk-images/Styles/7204_Resolve.png',         // 堅毅
  };
  return styleMap[styleId] || 'perk-images/Styles/7201_Precision.png';
}

// 取得符文路徑
function getRunePath(runeId: number): string {
  // 主宰系 (8000)
  if ([8112, 8124, 8128, 9923].includes(runeId)) return '7200_Domination/Electrocute';
  if ([8126, 8139, 8143].includes(runeId)) return '7200_Domination/Predator';
  if ([8120, 8136, 8138].includes(runeId)) return '7200_Domination/DarkHarvest';
  if ([8351, 8360, 8369, 8304].includes(runeId)) return '7200_Domination/HailOfBlades';

  // 精密系 (8100)
  if ([8005, 8008, 8021, 8010].includes(runeId)) return '7201_Precision/PressTheAttack';
  if ([8008].includes(runeId)) return '7201_Precision/LethalTempo';
  if ([8021].includes(runeId)) return '7201_Precision/FleetFootwork';
  if ([8010].includes(runeId)) return '7201_Precision/Conqueror';

  // 巫術系 (8200)
  if ([8214, 8229, 8226, 8275].includes(runeId)) return '7202_Sorcery/SummonAery';
  if ([8229].includes(runeId)) return '7202_Sorcery/ArcaneComet';
  if ([8230].includes(runeId)) return '7202_Sorcery/PhaseRush';

  // 堅毅系 (8400)
  if ([8437, 8439, 8465, 8446].includes(runeId)) return '7204_Resolve/GraspOfTheUndying';
  if ([8439].includes(runeId)) return '7204_Resolve/Aftershock';
  if ([8465].includes(runeId)) return '7204_Resolve/Guardian';

  // 啟發系 (8300)
  if ([8351, 8360, 8358, 8306].includes(runeId)) return '7203_Whimsy/GlacialAugment';
  if ([8360].includes(runeId)) return '7203_Whimsy/UnsealedSpellbook';
  if ([8369].includes(runeId)) return '7203_Whimsy/FirstStrike';

  return '7201_Precision';
}

// 計算相對時間
function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `About ${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

interface PlayerRank {
  puuid: string;
  rank: {
    tier: string;
    rank: string;
    leaguePoints: number;
  } | null;
}

export default function MatchCard({ matchId, puuid }: MatchCardProps) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [playerRanks, setPlayerRanks] = useState<Record<string, PlayerRank['rank']>>({});

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await fetch(`/api/match/${matchId}`);
        if (response.ok) {
          const data = await response.json();
          setMatch(data);
        }
      } catch (error) {
        console.error('Failed to fetch match:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  // 當展開時才載入排位資訊
  useEffect(() => {
    if (expanded && match && Object.keys(playerRanks).length === 0) {
      const fetchRanks = async () => {
        try {
          const puuids = match.info.participants.map(p => p.puuid);
          const response = await fetch('/api/ranks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ puuids }),
          });

          if (response.ok) {
            const data = await response.json();
            const ranksMap: Record<string, PlayerRank['rank']> = {};
            data.ranks.forEach((r: PlayerRank) => {
              ranksMap[r.puuid] = r.rank;
            });
            setPlayerRanks(ranksMap);
          }
        } catch (error) {
          console.error('Failed to fetch ranks:', error);
        }
      };

      fetchRanks();
    }
  }, [expanded, match, playerRanks]);

  if (loading) {
    return (
      <div className="rounded-lg bg-gray-700 p-4 animate-pulse">
        <div className="h-20 bg-gray-600 rounded"></div>
      </div>
    );
  }

  if (!match) {
    return null;
  }

  // 找到當前玩家的資料
  const player = match.info.participants.find(p => p.puuid === puuid);
  if (!player) return null;

  const isWin = player.win;
  const gameDuration = Math.floor(match.info.gameDuration / 60); // 轉換為分鐘
  const queueName = QUEUE_NAMES[match.info.queueId] || '其他模式';
  const kda = ((player.kills + player.assists) / Math.max(player.deaths, 1)).toFixed(2);
  const relativeTime = getRelativeTime(match.info.gameEndTimestamp);

  // 分隊（藍方 vs 紅方）
  const team1 = match.info.participants.filter(p => p.teamId === 100);
  const team2 = match.info.participants.filter(p => p.teamId === 200);

  return (
    <div
      className={`rounded-lg border-l-4 ${
        isWin ? 'border-blue-500 bg-blue-900/20' : 'border-red-500 bg-red-900/20'
      } overflow-hidden transition-all hover:shadow-lg`}
    >
      {/* 摘要資訊 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between">
          {/* 左側：遊戲資訊 */}
          <div className="flex items-center gap-4">
            {/* 英雄頭像、符文、召喚師技能 */}
            <div className="flex items-center gap-2">
              {/* 英雄頭像 */}
              <div className="relative">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/15.21.1/img/champion/${player.championName}.png`}
                  alt={player.championName}
                  className="h-16 w-16 rounded-lg"
                  onError={(e) => {
                    // 如果最新版本失敗，嘗試舊版本
                    const currentSrc = e.currentTarget.src;
                    if (currentSrc.includes('15.21.1')) {
                      e.currentTarget.src = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${player.championName}.png`;
                    } else {
                      // 都失敗就用預設圖示
                      e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/15.21.1/img/profileicon/29.png';
                    }
                  }}
                />
                <div className="absolute -bottom-1 -right-1 rounded bg-gray-900 px-1 text-xs text-white">
                  {player.champLevel}
                </div>
              </div>

              {/* 召喚師技能與符文 */}
              <div className="flex flex-col gap-1">
                {/* 召喚師技能 */}
                <div className="flex flex-col gap-0.5">
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.21.1/img/spell/${getSummonerSpellIcon(player.summoner1Id)}.png`}
                    alt="Summoner 1"
                    className="h-5 w-5 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.21.1/img/spell/${getSummonerSpellIcon(player.summoner2Id)}.png`}
                    alt="Summoner 2"
                    className="h-5 w-5 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* 符文 */}
              <div className="flex flex-col gap-0.5">
                {player.perks && player.perks.styles && player.perks.styles.length > 0 && (
                  <>
                    {/* 主要符文 */}
                    <div className="h-5 w-5 rounded-full bg-gray-900">
                      <img
                        src={`https://ddragon.canisback.com/img/${getRuneIcon(player.perks.styles[0].selections[0].perk)}`}
                        alt="Primary Rune"
                        className="h-full w-full rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    {/* 次要符文系統 */}
                    {player.perks.styles.length > 1 && (
                      <div className="h-5 w-5 rounded-full bg-gray-900">
                        <img
                          src={`https://ddragon.canisback.com/img/${getRuneStyleIcon(player.perks.styles[1].style)}`}
                          alt="Secondary Rune"
                          className="h-full w-full rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* KDA 和基本資訊 */}
            <div>
              <div className="text-sm font-semibold text-gray-300">
                {queueName}
              </div>
              <div className="text-xs text-gray-400 mb-1">
                {relativeTime}
              </div>
              <div className={`text-lg font-bold ${isWin ? 'text-blue-400' : 'text-red-400'}`}>
                {isWin ? '勝利' : '失敗'}
              </div>
              <div className="text-sm text-gray-400">
                {gameDuration}分鐘
              </div>
              <div className="text-lg text-white mt-1">
                {player.kills} / {player.deaths} / {player.assists}
                <span className="ml-2 text-sm text-gray-400">KDA {kda}</span>
              </div>
            </div>
          </div>

          {/* 右側：裝備 */}
          <div className="flex items-center gap-2">
            {/* 裝備欄位 */}
            <div className="grid grid-cols-4 gap-1">
              {[player.item0, player.item1, player.item2, player.item3, player.item4, player.item5].map(
                (itemId, idx) => (
                  <div
                    key={idx}
                    className="h-8 w-8 rounded bg-gray-800"
                  >
                    {itemId !== 0 && (
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/15.21.1/img/item/${itemId}.png`}
                        alt={`Item ${itemId}`}
                        className="h-full w-full rounded"
                      />
                    )}
                  </div>
                )
              )}
            </div>

            {/* 飾品 */}
            <div className="h-8 w-8 rounded bg-gray-800">
              {player.item6 !== 0 && (
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/15.21.1/img/item/${player.item6}.png`}
                  alt="Trinket"
                  className="h-full w-full rounded"
                />
              )}
            </div>

            {/* 展開/收合圖示 */}
            <div className="ml-4 text-gray-400">
              {expanded ? '▲' : '▼'}
            </div>
          </div>
        </div>
      </button>

      {/* 詳細資訊（展開時顯示） */}
      {expanded && (
        <div className="border-t border-gray-700 bg-gray-800/50 p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 藍方隊伍 */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-blue-400">藍方</h4>
              <div className="space-y-1">
                {team1.map((p) => (
                  <div
                    key={p.puuid}
                    className={`flex items-center gap-2 rounded p-1 text-xs ${
                      p.puuid === puuid ? 'bg-blue-900/30' : ''
                    }`}
                  >
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.21.1/img/champion/${p.championName}.png`}
                      alt={p.championName}
                      className="h-6 w-6 rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/15.21.1/img/profileicon/29.png';
                      }}
                    />
                    <Link
                      href={`/summoner/${encodeURIComponent(p.riotIdGameName)}-${p.riotIdTagline}`}
                      className="flex-1 truncate text-white hover:text-blue-400 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{p.riotIdGameName}</span>
                        <span className="text-gray-500 text-[10px]">#{p.riotIdTagline}</span>
                      </div>
                      {playerRanks[p.puuid] && (
                        <div className={`text-[10px] font-semibold ${getTierColor(playerRanks[p.puuid]!.tier)}`}>
                          {getTierShort(playerRanks[p.puuid]!.tier, playerRanks[p.puuid]!.rank)}
                        </div>
                      )}
                    </Link>
                    <div className="text-gray-400 text-right">
                      {p.kills}/{p.deaths}/{p.assists}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 紅方隊伍 */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-red-400">紅方</h4>
              <div className="space-y-1">
                {team2.map((p) => (
                  <div
                    key={p.puuid}
                    className={`flex items-center gap-2 rounded p-1 text-xs ${
                      p.puuid === puuid ? 'bg-red-900/30' : ''
                    }`}
                  >
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/15.21.1/img/champion/${p.championName}.png`}
                      alt={p.championName}
                      className="h-6 w-6 rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://ddragon.leagueoflegends.com/cdn/15.21.1/img/profileicon/29.png';
                      }}
                    />
                    <Link
                      href={`/summoner/${encodeURIComponent(p.riotIdGameName)}-${p.riotIdTagline}`}
                      className="flex-1 truncate text-white hover:text-red-400 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>{p.riotIdGameName}</span>
                        <span className="text-gray-500 text-[10px]">#{p.riotIdTagline}</span>
                      </div>
                      {playerRanks[p.puuid] && (
                        <div className={`text-[10px] font-semibold ${getTierColor(playerRanks[p.puuid]!.tier)}`}>
                          {getTierShort(playerRanks[p.puuid]!.tier, playerRanks[p.puuid]!.rank)}
                        </div>
                      )}
                    </Link>
                    <div className="text-gray-400 text-right">
                      {p.kills}/{p.deaths}/{p.assists}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 額外統計 */}
          <div className="mt-4 grid grid-cols-4 gap-4 border-t border-gray-700 pt-4 text-center text-xs">
            <div>
              <div className="text-gray-400">傷害</div>
              <div className="text-white">{player.totalDamageDealtToChampions.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">金錢</div>
              <div className="text-white">{player.goldEarned.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">補兵</div>
              <div className="text-white">{player.totalMinionsKilled + player.neutralMinionsKilled}</div>
            </div>
            <div>
              <div className="text-gray-400">視野分數</div>
              <div className="text-white">-</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
