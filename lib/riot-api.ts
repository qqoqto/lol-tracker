import type {
  Summoner,
  Account,
  LeagueEntry,
  Match,
  Region,
  RegionalRoute
} from '@/types/riot';
import { REGIONAL_ROUTING } from '@/types/riot';

const API_KEY = process.env.RIOT_API_KEY;

if (!API_KEY) {
  throw new Error('RIOT_API_KEY is not defined in environment variables');
}

// 取得地區性路由（用於 Account API 和 Match API）
function getRegionalRoute(region: Region): RegionalRoute {
  return REGIONAL_ROUTING[region];
}

// 取得 Match API 專用的路由（台服需使用 sea）
function getMatchRoute(region: Region): RegionalRoute {
  // 台服的 Match API 使用 sea routing
  if (region === 'tw2') return 'sea';
  return REGIONAL_ROUTING[region];
}

// 基礎請求函數
async function riotRequest<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'X-Riot-Token': API_KEY!,
    },
    next: { revalidate: 300 }, // 快取 5 分鐘
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Riot API Error (${response.status}): ${error}`);
  }

  return response.json();
}

// 1. 透過遊戲名稱和標籤取得 Account (PUUID)
export async function getAccountByRiotId(
  gameName: string,
  tagLine: string,
  region: Region = 'tw2'
): Promise<Account> {
  const route = getRegionalRoute(region);
  const url = `https://${route}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotRequest<Account>(url);
}

// 2. 透過 PUUID 取得 Summoner
export async function getSummonerByPuuid(
  puuid: string,
  region: Region = 'tw2'
): Promise<Summoner> {
  const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return riotRequest<Summoner>(url);
}

// 3. 取得排位資料 (使用 PUUID - 2025年7月後 summonerId 已被移除)
export async function getLeagueEntries(
  puuid: string,
  region: Region = 'tw2'
): Promise<LeagueEntry[]> {
  const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  return riotRequest<LeagueEntry[]>(url);
}

// 4. 取得對戰記錄 ID 列表
export async function getMatchIdsByPuuid(
  puuid: string,
  region: Region = 'tw2',
  count: number = 20
): Promise<string[]> {
  const route = getMatchRoute(region); // Match API 使用專用 routing
  const url = `https://${route}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
  return riotRequest<string[]>(url);
}

// 5. 取得單場對戰詳細資料
export async function getMatchById(
  matchId: string,
  region: Region = 'tw2'
): Promise<Match> {
  const route = getMatchRoute(region); // Match API 使用專用 routing
  const url = `https://${route}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  return riotRequest<Match>(url);
}

// 整合函數：透過遊戲名稱取得完整召喚師資料
export async function getSummonerProfile(
  gameName: string,
  tagLine: string = 'tw2', // 台服預設標籤（必須小寫）
  region: Region = 'tw2'
) {
  try {
    // 1. 取得 Account (包含 PUUID)
    const account = await getAccountByRiotId(gameName, tagLine, region);

    // 2. 透過 PUUID 取得 Summoner
    const summoner = await getSummonerByPuuid(account.puuid, region);

    // 3. 取得排位資料 (直接使用 PUUID)
    const leagues = await getLeagueEntries(account.puuid, region);

    // 4. 取得最近對戰 ID
    const matchIds = await getMatchIdsByPuuid(account.puuid, region, 10);

    return {
      account,
      summoner,
      leagues,
      matchIds,
    };
  } catch (error) {
    console.error('Error fetching summoner profile:', error);
    throw error;
  }
}
