import { useEffect, useState } from "react";

/**
 * Returns `initial` until the component mounts, then `read()`. For values that only the browser
 * knows (URL, storage), so the server render and hydration agree. React 17 hosts have no
 * `useSyncExternalStore`.
 */
export default function useMountedValue<T>(read: () => T, initial: T): T {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    setValue(read());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
