// 測試單場對戰的詳細資料
const API_KEY = 'RGAPI-b8e22def-0f2b-43ed-8a21-474a20ee8388';
const matchId = 'TW2_348662495'; // 陳大牌的一場對戰

async function testMatchDetail() {
  console.log('測試對戰詳細資料...\n');

  const url = `https://sea.api.riotgames.com/lol/match/v5/matches/${matchId}`;

  try {
    const response = await fetch(url, {
      headers: { 'X-Riot-Token': API_KEY },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 成功獲取對戰資料\n');

      // 檢查第一個玩家的資料
      const firstPlayer = data.info.participants[0];
      console.log('第一個玩家的資料:');
      console.log('- puuid:', firstPlayer.puuid);
      console.log('- summonerName:', firstPlayer.summonerName);
      console.log('- riotIdGameName:', firstPlayer.riotIdGameName);
      console.log('- riotIdTagline:', firstPlayer.riotIdTagline);
      console.log('- championName:', firstPlayer.championName);

      console.log('\n所有玩家的名稱欄位:');
      data.info.participants.forEach((p, i) => {
        console.log(`${i + 1}. summonerName: "${p.summonerName}", riotIdGameName: "${p.riotIdGameName}", riotIdTagline: "${p.riotIdTagline}"`);
      });
    } else {
      const error = await response.text();
      console.log('❌ 失敗:', error);
    }
  } catch (error) {
    console.log('❌ 錯誤:', error.message);
  }
}

testMatchDetail();
