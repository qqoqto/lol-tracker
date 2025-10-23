'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 地區選項
const REGIONS = [
  { value: 'tw2', label: '台灣 (TW)', tagLine: 'TW2' },
  { value: 'kr', label: '韓國 (KR)', tagLine: 'KR' },
  { value: 'jp1', label: '日本 (JP)', tagLine: 'JP1' },
  { value: 'na1', label: '北美 (NA)', tagLine: 'NA1' },
  { value: 'euw1', label: '西歐 (EUW)', tagLine: 'EUW' },
  { value: 'eun1', label: '北歐與東歐 (EUNE)', tagLine: 'EUNE' },
  { value: 'br1', label: '巴西 (BR)', tagLine: 'BR1' },
  { value: 'la1', label: '拉丁美洲北 (LAN)', tagLine: 'LAN' },
  { value: 'la2', label: '拉丁美洲南 (LAS)', tagLine: 'LAS' },
  { value: 'oc1', label: '大洋洲 (OCE)', tagLine: 'OCE' },
  { value: 'tr1', label: '土耳其 (TR)', tagLine: 'TR' },
  { value: 'ru', label: '俄羅斯 (RU)', tagLine: 'RU' },
  { value: 'ph2', label: '菲律賓 (PH)', tagLine: 'PH2' },
  { value: 'sg2', label: '新加坡 (SG)', tagLine: 'SG2' },
  { value: 'th2', label: '泰國 (TH)', tagLine: 'TH2' },
  { value: 'vn2', label: '越南 (VN)', tagLine: 'VN2' },
];

export default function Home() {
  const [gameName, setGameName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('tw2');
  const [tagLine, setTagLine] = useState('tw2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 當地區改變時，自動更新 tagLine
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    const selectedRegionData = REGIONS.find(r => r.value === region);
    if (selectedRegionData) {
      setTagLine(selectedRegionData.tagLine.toLowerCase());
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gameName.trim()) {
      setError('請輸入召喚師名稱');
      return;
    }

    if (!tagLine.trim()) {
      setError('請輸入或選擇 Tag Line');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(selectedRegion)}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '查詢失敗');
      }

      // 成功後導向到召喚師頁面
      router.push(`/summoner/${gameName}-${tagLine}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl text-center">
          {/* 標題 */}
          <h1 className="mb-4 text-5xl font-bold text-white">
            LOL 戰績查詢
          </h1>
          <p className="mb-12 text-lg text-gray-300">
            即時查詢英雄聯盟召喚師戰績、排位資訊與對戰記錄
          </p>

          {/* 搜尋表單 */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col gap-4">
              {/* 第一排：召喚師名稱 */}
              <div className="flex flex-col gap-2">
                <label className="text-left text-sm font-semibold text-gray-300">
                  召喚師名稱 (Summoner Name)
                </label>
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="例如：Hide on bush"
                  className="h-14 w-full rounded-lg border-2 border-transparent bg-white px-6 text-lg text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              {/* 第二排：地區和 Tag Line */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 地區選擇 */}
                <div className="flex flex-col gap-2">
                  <label className="text-left text-sm font-semibold text-gray-300">
                    地區 (Region)
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="h-14 w-full rounded-lg border-2 border-transparent bg-white px-6 text-lg text-gray-900 outline-none transition-all focus:border-blue-500"
                    disabled={loading}
                  >
                    {REGIONS.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag Line */}
                <div className="flex flex-col gap-2">
                  <label className="text-left text-sm font-semibold text-gray-300">
                    Tag Line
                  </label>
                  <input
                    type="text"
                    value={tagLine}
                    onChange={(e) => setTagLine(e.target.value.toLowerCase())}
                    placeholder="例如：kr1"
                    className="h-14 w-full rounded-lg border-2 border-transparent bg-white px-6 text-lg text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 搜尋按鈕 */}
              <button
                type="submit"
                disabled={loading}
                className="h-14 rounded-lg bg-blue-600 text-lg font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? '搜尋中...' : '🔍 搜尋召喚師'}
              </button>
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="mt-4 rounded-lg bg-red-500/20 p-4 text-red-200">
                {error}
              </div>
            )}
          </form>

          {/* 使用說明 */}
          <div className="rounded-lg bg-white/10 p-6 text-left text-gray-300 backdrop-blur-sm">
            <h3 className="mb-3 font-semibold text-white">💡 使用說明</h3>
            <ul className="space-y-2 text-sm">
              <li>• 選擇你的遊戲地區，Tag Line 會自動填入</li>
              <li>• 也可以手動修改 Tag Line（例如：特殊帳號標籤）</li>
              <li>• 支援查詢所有地區的召喚師資料</li>
              <li>• 查詢內容包含：排位資訊、對戰記錄、統計圖表等</li>
            </ul>
          </div>

          {/* 範例 */}
          <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-gray-300 sm:grid-cols-2">
            <div className="rounded-lg bg-white/5 p-3">
              <div className="font-semibold text-white">台服範例：</div>
              <div>陳大牌 → TW2</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <div className="font-semibold text-white">韓服範例：</div>
              <div>Hide on bush → KR</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
