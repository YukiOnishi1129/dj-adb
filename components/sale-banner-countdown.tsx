"use client";

import { useEffect, useState } from "react";

interface SaleBannerCountdownProps {
  endDate: string;
  /** コンパクト表示（モバイルバナー用） */
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export function SaleBannerCountdown({ endDate, compact = false }: SaleBannerCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return <span className="font-bold">終了</span>;
  }

  // コンパクト表示（スマホバナー用）
  if (compact) {
    if (timeLeft.days > 0) {
      return (
        <span className="font-bold tabular-nums">
          {timeLeft.days}日{timeLeft.hours}時間
        </span>
      );
    }
    return (
      <span className="font-bold tabular-nums">
        {timeLeft.hours}時間{timeLeft.minutes}分
      </span>
    );
  }

  // 2D-ADB風の表示（白背景用に黒/グレー文字）
  return (
    <div className="flex items-baseline gap-1">
      {timeLeft.days > 0 && (
        <>
          <span className="text-3xl font-bold tabular-nums text-orange-500">
            {timeLeft.days}
          </span>
          <span className="text-sm text-gray-500 mr-2">日</span>
        </>
      )}
      <span className="text-3xl font-bold tabular-nums text-orange-500">
        {timeLeft.hours}
      </span>
      <span className="text-sm text-gray-500 mr-2">時間</span>
      <span className="text-3xl font-bold tabular-nums text-orange-500">
        {timeLeft.minutes}
      </span>
      <span className="text-sm text-gray-500">分</span>
    </div>
  );
}
