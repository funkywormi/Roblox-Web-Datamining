import { useRef, useState, useCallback, MutableRefObject } from "react";

const useSyncedState = <T>(initialValue: T): [T, (value: T) => void, MutableRefObject<T>] => {
  const ref = useRef<T>(initialValue);
  const [stateValue, setStateValue] = useState<T>(initialValue);

  const setBothValues = useCallback((newValue: T) => {
    ref.current = newValue;
    setStateValue(newValue);
  }, []);

  return [stateValue, setBothValues, ref];
};

export default useSyncedState;
