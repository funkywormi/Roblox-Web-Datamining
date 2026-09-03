import { useState, useRef, useEffect } from "react";

export const SECONDS_BETWEEN_RESENDS = 30;

export type UserCountdownTimerProps = {
  timeUntilActionEnabled: number;

  setIsActionEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setTimeUntilActionEnabled: React.Dispatch<React.SetStateAction<number>>;
};
export const useCountdown = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef(0);

  const startCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setSeconds(initialSeconds);
    intervalRef.current = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetCountdown = () => {
    stopCountdown();
    setSeconds(initialSeconds);
  };

  useEffect(() => {
    // Cleanup function to clear the interval when the component unmounts
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return { seconds, startCountdown, stopCountdown, resetCountdown };
};
