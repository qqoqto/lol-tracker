// Riot API 型別定義

// 召喚師資料
export interface Summoner {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
  name?: string; // API v5 之後在其他 endpoint
}

// 召喚師帳號資料 (ACCOUNT-V1)
export interface Account {
  puuid: string;
  gameName: string;
  tagLine: string;
}

// 排位資料
export interface LeagueEntry {
  leagueId: string;
  summonerId: string;
  queueType: 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' | 'RANKED_FLEX_TT';
  tier: 'IRON' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'EMERALD' | 'DIAMOND' | 'MASTER' | 'GRANDMASTER' | 'CHALLENGER';
  rank: 'I' | 'II' | 'III' | 'IV';
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

// 對戰記錄參與者
export interface MatchParticipant {
  puuid: string;
  summonerName?: string; // 已廢棄，可能為空
  riotIdGameName: string; // 新的 Riot ID 遊戲名稱
  riotIdTagline: string; // 新的 Riot ID 標籤
  championId: number;
  championName: string;
  teamId: number;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  goldEarned: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  champLevel: number;
  win: boolean;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
  perks: {
    styles: Array<{
      description: string;
      selections: Array<{
        perk: number;
        var1: number;
        var2: number;
        var3: number;
      }>;
      style: number;
    }>;
  };
}

// 對戰記錄
export interface Match {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[]; // puuids
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameEndTimestamp: number;
    gameId: number;
    gameMode: string;
    gameName: string;
    gameStartTimestamp: number;
    gameType: string;
    gameVersion: string;
    mapId: number;
    participants: MatchParticipant[];
    platformId: string;
    queueId: number;
  };
}

// 地區對應
export const REGIONS = {
  tw2: 'tw2',      // 台灣
  kr: 'kr',        // 韓國
  jp1: 'jp1',      // 日本
  na1: 'na1',      // 北美
  euw1: 'euw1',    // 西歐
  eun1: 'eun1',    // 北歐與東歐
} as const;

export const REGIONAL_ROUTING = {
  tw2: 'asia',     // 台灣的 Account API 使用 asia routing
  kr: 'asia',
  jp1: 'asia',
  na1: 'americas',
  euw1: 'europe',
  eun1: 'europe',
} as const;

export type Region = keyof typeof REGIONS;
export type RegionalRoute = typeof REGIONAL_ROUTING[Region];
