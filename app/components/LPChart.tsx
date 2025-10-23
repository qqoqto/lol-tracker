'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LPDataPoint {
  gameNumber: number;
  lp: number;
  win: boolean;
  timestamp: number;
  championName: string;
}

interface LPChartProps {
  data: LPDataPoint[];
}

export default function LPChart({ data }: LPChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-800 text-gray-400">
        沒有足夠的排位數據顯示 LP 變化
      </div>
    );
  }

  // 格式化資料供圖表使用
  const chartData = data.map((point, index) => ({
    game: `第${point.gameNumber}場`,
    LP: point.lp,
    gameNumber: point.gameNumber,
    win: point.win,
    championName: point.championName,
  }));

  // 自定義提示框
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-600 bg-gray-900 p-3 shadow-lg">
          <p className="text-sm font-semibold text-white">{data.game}</p>
          <p className="text-sm text-gray-300">英雄: {data.championName}</p>
          <p className={`text-sm font-bold ${data.win ? 'text-blue-400' : 'text-red-400'}`}>
            {data.win ? '勝利' : '失敗'}
          </p>
          <p className="text-sm text-yellow-400">LP: {data.LP}</p>
        </div>
      );
    }
    return null;
  };

  // 計算 LP 範圍
  const lpValues = data.map(d => d.lp);
  const minLP = Math.min(...lpValues);
  const maxLP = Math.max(...lpValues);
  const lpRange = maxLP - minLP;
  const yAxisMin = Math.max(0, minLP - lpRange * 0.1);
  const yAxisMax = maxLP + lpRange * 0.1;

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="game"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            domain={[yAxisMin, yAxisMax]}
            label={{ value: 'LP', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="LP"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={payload.win ? '#3B82F6' : '#EF4444'}
                  stroke="#1F2937"
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 圖例 */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-300">勝利</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-gray-300">失敗</span>
        </div>
      </div>
    </div>
  );
}
