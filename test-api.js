// Riot API 測試腳本 - 逐步診斷 403 錯誤
// 使用方法: node test-api.js

const API_KEY = 'RGAPI-b8e22def-0f2b-43ed-8a21-474a20ee8388'; // 替換成你的最新金鑰

async function testEndpoint(name, url) {
  console.log(`\n🔍 測試: ${name}`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': API_KEY,
      },
    });

    console.log(`狀態碼: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 成功!');
      console.log('回應資料:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
      return data;
    } else {
      const error = await response.text();
      console.log('❌ 失敗!');
      console.log('錯誤訊息:', error);
      return null;
    }
  } catch (error) {
    console.log('❌ 請求錯誤:', error.message);
    return null;
  }
}

async function diagnose() {
  console.log('=================================');
  console.log('   Riot API 診斷工具');
  console.log('=================================');

  // 測試 1: Account API (ACCOUNT-V1) - 測試不同的 tagLine 大小寫
  const gameName = '陳大牌';

  console.log('\n=== 測試大寫 TW2 ===');
  let tagLine = 'TW2';
  console.log(`\n📋 測試召喚師: ${gameName}#${tagLine}`);

  const account = await testEndpoint(
    '1. 取得 Account (ACCOUNT-V1)',
    `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );

  if (!account) {
    console.log('\n⚠️  無法取得 Account 資料，停止後續測試');
    return;
  }

  // 測試 2: Summoner API (SUMMONER-V4)
  const summoner = await testEndpoint(
    '2. 取得 Summoner (SUMMONER-V4)',
    `https://tw2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`
  );

  if (!summoner) {
    console.log('\n⚠️  無法取得 Summoner 資料，停止後續測試');
    return;
  }

  // 測試 3: League API (LEAGUE-V4) - 使用 PUUID 而非 summoner.id
  await testEndpoint(
    '3. 取得排位資料 (LEAGUE-V4) - 使用 PUUID ✅',
    `https://tw2.api.riotgames.com/lol/league/v4/entries/by-puuid/${account.puuid}`
  );

  // 測試 4: Match API (MATCH-V5)
  await testEndpoint(
    '4. 取得對戰列表 (MATCH-V5)',
    `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${account.puuid}/ids?start=0&count=5`
  );

  console.log('\n=================================');
  console.log('   測試完成 - 大寫 TW2');
  console.log('=================================');

  // 再測試小寫 tw2
  console.log('\n\n=== 測試小寫 tw2 ===');
  tagLine = 'tw2';
  console.log(`\n📋 測試召喚師: ${gameName}#${tagLine}`);

  const account2 = await testEndpoint(
    '1. 取得 Account (ACCOUNT-V1) - 小寫',
    `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );

  console.log('\n=================================');
  console.log('   診斷完成');
  console.log('=================================');
}

diagnose();
