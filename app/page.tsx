'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('tw2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gameName.trim()) {
      setError('請輸入召喚師名稱');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '查詢失敗');
      }

      // 成功後導向到召喚師頁面（之後會建立）
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
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* 召喚師名稱輸入 */}
              <div className="flex-1">
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="輸入召喚師名稱"
                  className="h-14 w-full rounded-lg border-2 border-transparent bg-white px-6 text-lg text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              {/* 標籤輸入 */}
              <div className="w-full sm:w-32">
                <input
                  type="text"
                  value={tagLine}
                  onChange={(e) => setTagLine(e.target.value.toLowerCase())}
                  placeholder="tw2"
                  className="h-14 w-full rounded-lg border-2 border-transparent bg-white px-4 text-center text-lg text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              {/* 搜尋按鈕 */}
              <button
                type="submit"
                disabled={loading}
                className="h-14 rounded-lg bg-blue-600 px-8 text-lg font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? '搜尋中...' : '搜尋'}
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
            <h3 className="mb-3 font-semibold text-white">使用說明</h3>
            <ul className="space-y-2 text-sm">
              <li>• 請輸入完整的遊戲名稱和標籤（例如：Hide on bush #kr1）</li>
              <li>• 台服玩家標籤通常是 tw2（小寫）</li>
              <li>• 支援查詢排位資訊、對戰記錄等</li>
            </ul>
          </div>

          {/* 範例 */}
          <div className="mt-6 text-sm text-gray-400">
            範例：gameName = "Hide on bush"，tagLine = "kr1"
          </div>
        </div>
      </div>
    </div>
  );
}
