'use client';

interface WinRateCircleProps {
  wins: number;
  losses: number;
  size?: number;
}

export default function WinRateCircle({ wins, losses, size = 120 }: WinRateCircleProps) {
  const total = wins + losses;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  // SVG 圓形參數
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (winRate / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* 背景圓圈 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
          />
          {/* 勝率圓圈 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* 中心文字 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-white">
            {total}
          </div>
          <div className="text-xs text-gray-400">場</div>
          <div className="mt-1 text-sm font-semibold text-blue-400">
            {winRate.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* 勝敗統計 */}
      <div className="mt-3 flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-blue-400">{wins}勝</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-gray-600"></div>
          <span className="text-red-400">{losses}敗</span>
        </div>
      </div>
    </div>
  );
}
