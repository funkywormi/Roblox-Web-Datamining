import { useEffect, useState } from "react";

/**
 * Returns `serverValue` on the server and on the first client render so SSR
 * HTML matches hydration, then replaces it with `readClientValue()` after mount.
 *
 * Callers should pass a stable reader (module-level function or memoized callback).
 */
export function useClientOnlyValue<T>(readClientValue: () => T, serverValue: T): T {
  const [value, setValue] = useState<T>(serverValue);
  useEffect(() => {
    setValue(readClientValue());
    // Read once after mount; callers pass a stable reader.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only read
  }, []);
  return value;
}
