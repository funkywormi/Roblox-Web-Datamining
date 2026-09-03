import { useRef } from "react";

/**
 * Hook to track the latest value of a variable that meets a condition.
 * @param value value to track
 * @param conditionFn function that returns whether the value should be updated
 */
const useLatest = <T>(value: T, conditionFn: (value: T) => boolean) => {
  const ref = useRef<T>();

  if (conditionFn(value)) {
    ref.current = value;
  }

  return ref.current;
};

export default useLatest;
