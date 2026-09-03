import { useEffect, useMemo, useState } from 'react';

export type UseCountdownResult = {
  remainingSeconds: number;
  isActive: boolean;
  clear: () => void;
};

const useCountdown = (
  expiresAt: number,
  setExpiresAt: (value: number) => void
): UseCountdownResult => {
  const [now, setNow] = useState(Date.now());

  // Update now immediately when expiresAt changes
  useEffect(() => {
    setNow(Date.now());
  }, [expiresAt]);

  // Calculate remaining seconds based on current time vs expiration
  const remainingSeconds = useMemo(() => {
    if (!expiresAt || expiresAt <= 0) return 0;
    const msRemaining = expiresAt - now;
    return msRemaining > 0 ? Math.ceil(msRemaining / 1000) : 0;
  }, [expiresAt, now]);

  // Update current time every second when countdown is active
  useEffect(() => {
    if (remainingSeconds <= 0) {
      if (expiresAt > 0) {
        setExpiresAt(0);
      }
      return undefined;
    }

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [remainingSeconds, expiresAt, setExpiresAt]);

  const clear = (): void => {
    setExpiresAt(0);
  };

  return {
    remainingSeconds,
    isActive: remainingSeconds > 0,
    clear
  };
};

export default useCountdown;
