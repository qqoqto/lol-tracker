// 測試 Match API
const API_KEY = 'RGAPI-b8e22def-0f2b-43ed-8a21-474a20ee8388';

async function getAccount(gameName, tagLine) {
  const url = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const response = await fetch(url, {
    headers: { 'X-Riot-Token': API_KEY },
  });
  return response.json();
}

async function testMatches() {
  console.log('測試 Match API...\n');

  // 測試多個帳號
  const testAccounts = [
    { gameName: 'Ko8e24', tagLine: '0824' },
    { gameName: '陳大牌', tagLine: 'tw2' },
    // 可以加入你自己的帳號或其他台服玩家
  ];

  for (const { gameName, tagLine } of testAccounts) {
    console.log(`\n${'='.repeat(50)}`);
    const account = await getAccount(gameName, tagLine);
    console.log(`測試帳號: ${account.gameName}#${account.tagLine}`);

    const puuid = account.puuid;

  // 測試不同的參數組合
  const tests = [
    { name: '預設 (count=20)', url: `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20` },
    { name: '少量 (count=5)', url: `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5` },
    { name: '不指定 count', url: `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids` },
    { name: '指定 queue (ranked)', url: `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=20` },
  ];

    // 只測試第一個選項就好
    const test = tests[0];
    console.log(`URL: ${test.url.substring(0, 80)}...`);

    try {
      const response = await fetch(test.url, {
        headers: { 'X-Riot-Token': API_KEY },
      });

      console.log(`狀態碼: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`結果: 找到 ${data.length} 場對戰`);
        if (data.length > 0) {
          console.log('✅ 有對戰記錄!', data.slice(0, 2));
        } else {
          console.log('⚠️  沒有對戰記錄（可能很久沒玩或資料已過期）');
        }
      } else {
        const error = await response.text();
        console.log('❌ 失敗:', error);
      }
    } catch (error) {
      console.log('❌ 錯誤:', error.message);
    }
  }
}

testMatches();
