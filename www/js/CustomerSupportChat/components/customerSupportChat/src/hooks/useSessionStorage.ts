import { useState, useEffect } from "react";

const useSessionStorage = <T>(key: string, pollIntervalMs = 1000): T | null => {
  const [value, setValue] = useState<T | null>(() => {
    const storedValue = sessionStorage.getItem(key);
    try {
      return storedValue ? (JSON.parse(storedValue) as T) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const storedValue = sessionStorage.getItem(key);
      try {
        const parsedValue = storedValue ? (JSON.parse(storedValue) as T) : null;
        if (JSON.stringify(parsedValue) !== JSON.stringify(value)) {
          setValue(parsedValue);
        }
      } catch {
        setValue(null);
      }
    }, pollIntervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [key, value, pollIntervalMs]);

  return value;
};

export default useSessionStorage;
