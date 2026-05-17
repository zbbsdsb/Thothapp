import { useState, useEffect, useRef } from 'react';

const COLLAPSE_SECONDS = 180; // 3 minutes

export function useCountdown(isActive: boolean) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isDreamLost, setIsDreamLost] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef(countdown);

  // Keep ref in sync with state
  useEffect(() => {
    countdownRef.current = countdown;
  }, [countdown]);

  useEffect(() => {
    if (isActive && countdown === null && !isDreamLost) {
      setCountdown(COLLAPSE_SECONDS);
    }
  }, [isActive, countdown, isDreamLost]);

  useEffect(() => {
    if (countdown !== null && countdown > 0 && !timerRef.current) {
      // Only create interval once
      timerRef.current = setInterval(() => {
        const next = countdownRef.current! - 1;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setCountdown(0);
          setIsDreamLost(true);
        } else {
          setCountdown(next);
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [countdown]);

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(null);
    setIsDreamLost(false);
  };

  const cancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(null);
  };

  const format = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return { countdown, isDreamLost, reset, cancel, format };
}
