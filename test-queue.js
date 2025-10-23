// 測試不同 Queue 的對戰記錄
const API_KEY = 'RGAPI-b8e22def-0f2b-43ed-8a21-474a20ee8388';
const puuid = '7n1_4k46wLtM69i3W2yKlYgDcNpMlO16hOhO1k344HBVhSHqLhoSzp2xLVwJpHYWClNe5lowNChirA'; // 陳大牌

async function testQueues() {
  console.log('測試陳大牌的對戰記錄...\n');

  const routings = ['asia', 'sea'];

  for (const routing of routings) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`使用 routing: ${routing}`);
    console.log('='.repeat(50));

    const tests = [
      { name: '不指定 queue', url: `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=20` },
      { name: 'ARAM (450)', url: `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=450&count=20` },
      { name: 'Ranked Solo/Duo (420)', url: `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=20` },
    ];

  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);

    try {
      const response = await fetch(test.url, {
        headers: { 'X-Riot-Token': API_KEY },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ 找到 ${data.length} 場對戰`);
        if (data.length > 0) {
          console.log('前 3 筆:', data.slice(0, 3));
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
}

testQueues();
