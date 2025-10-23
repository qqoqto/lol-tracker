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
    <div className="min-h-screen bg-[#1a1d29]">
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          {/* Logo/標題 */}
          <div className="mb-12 text-center">
            <h1 className="mb-2 text-6xl font-bold text-white">
              LOL<span className="text-blue-500">.GG</span>
            </h1>
            <p className="text-gray-400">
              英雄聯盟召喚師戰績查詢
            </p>
          </div>

          {/* 搜尋列 */}
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-0 rounded-full bg-[#2a2d3a] p-2 shadow-2xl">
              {/* Region 下拉選單 */}
              <div className="relative">
                <div className="px-4 py-2">
                  <div className="mb-1 text-xs font-semibold text-gray-400">Region</div>
                  <select
                    value={selectedRegion}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="cursor-pointer appearance-none bg-transparent pr-8 text-base text-gray-300 outline-none"
                    disabled={loading}
                  >
                    {REGIONS.map((region) => (
                      <option key={region.value} value={region.value} className="bg-[#2a2d3a]">
                        {region.label.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 mt-1 text-gray-500">▼</div>
                </div>
              </div>

              {/* 分隔線 */}
              <div className="h-12 w-px bg-gray-700"></div>

              {/* 搜尋輸入框 */}
              <div className="flex-1 px-6 py-2">
                <div className="mb-1 text-xs font-semibold text-gray-400">Search</div>
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder={`Game name + #${tagLine.toUpperCase()}`}
                  className="w-full bg-transparent text-base text-gray-300 placeholder-gray-600 outline-none"
                  disabled={loading}
                />
              </div>

              {/* .GG 按鈕 */}
              <button
                type="submit"
                disabled={loading}
                className="mr-1 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  '.GG'
                )}
              </button>
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="mt-4 rounded-lg bg-red-500/20 p-4 text-center text-red-200">
                {error}
              </div>
            )}
          </form>

          {/* 使用提示 */}
          <div className="mt-8 text-center text-sm text-gray-500">
            例如：Hide on bush #KR1 或 陳大牌 #TW2
          </div>
        </div>
      </div>
    </div>
  );
}
