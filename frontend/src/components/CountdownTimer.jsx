import { useState, useEffect, useRef } from 'react';

/**
 * ============================================================
 * CountdownTimer — 倒计时子组件
 * ============================================================
 *
 * Props (父→子传值):
 *   endTime: string — ISO 时间字符串，促销截止时间
 *
 * 每秒自动刷新，到期后显示"已结束"
 * 显示格式: "DD 天 HH:MM:SS" 或 "HH:MM:SS"
 */
export default function CountdownTimer({ endTime }) {
  const [remaining, setRemaining] = useState(calcRemaining(endTime));
  const timerRef = useRef(null);

  useEffect(() => {
    // 立即计算一次
    setRemaining(calcRemaining(endTime));

    // 每秒刷新
    timerRef.current = setInterval(() => {
      const r = calcRemaining(endTime);
      setRemaining(r);
      // 倒计时结束，停止定时器
      if (r.expired) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [endTime]);

  if (remaining.expired) {
    return (
      <span
        className="countdown expired"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 8,
          background: '#dfe6e9',
          color: '#636e72',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        ⏰ 促销已结束
      </span>
    );
  }

  const urgent = remaining.totalHours < 2;

  return (
    <div
      className="countdown"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 8,
        background: urgent ? '#ffeaa7' : '#ffeaa7',
        color: urgent ? '#d63031' : '#e17055',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "'Courier New', Courier, monospace",
        animation: urgent ? 'pulse 0.8s ease-in-out infinite' : undefined,
      }}
    >
      <span>⏱️ 距结束</span>

      {remaining.days > 0 && (
        <>
          <TimeBlock value={remaining.days} label="天" urgent={urgent} />
          <Separator />
        </>
      )}

      <TimeBlock value={remaining.hours} label="" urgent={urgent} />
      <Separator />
      <TimeBlock value={remaining.minutes} label="" urgent={urgent} />
      <Separator />
      <TimeBlock value={remaining.seconds} label="" urgent={urgent} />
    </div>
  );
}

// ---- 子组件 ----

function TimeBlock({ value, label, urgent }) {
  const str = String(value).padStart(2, '0');
  return (
    <span
      style={{
        background: urgent ? '#d63031' : '#e17055',
        color: '#fff',
        padding: '2px 6px',
        borderRadius: 4,
        minWidth: 28,
        textAlign: 'center',
        fontSize: 14,
      }}
    >
      {str}
      {label && <span style={{ fontSize: 11, marginLeft: 1 }}>{label}</span>}
    </span>
  );
}

function Separator() {
  return (
    <span style={{ color: '#e17055', fontSize: 14, fontWeight: 700 }}>:</span>
  );
}

// ---- 工具函数 ----

function calcRemaining(endTime) {
  if (!endTime) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 };

  const diff = new Date(endTime).getTime() - Date.now();

  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const totalHours = Math.floor(totalSeconds / 3600);

  return { expired: false, days, hours, minutes, seconds, totalHours };
}
