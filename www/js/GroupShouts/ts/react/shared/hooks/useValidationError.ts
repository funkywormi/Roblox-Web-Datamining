import { useState, useEffect, useMemo, useRef } from 'react';
import isEqual from 'lodash/isEqual';
import { MessageContent } from '../types';

/**
 * A hook that provides debounced validation error messages.
 *
 * The hook will:
 * - Clear any validation error immediately when the value changes
 * - Only show validation errors after the user has stopped typing for the specified debounce time
 *
 * @param value - The current value to validate
 * @param getValidationErrorKey - Optional function that returns a translation key for the validation error
 * @param translate - Function to translate the error key into a user-facing message
 * @param debounceMs - Milliseconds to wait after the last change before showing validation errors (default: 300)
 * @returns The translated validation error message, or undefined if no error
 */
export default function useValidationError(
  value: MessageContent,
  getValidationErrorKey: ((value: MessageContent) => string | undefined) | undefined,
  translate: (key: string) => string,
  debounceMs = 300
): string | undefined {
  // Stabilize the value reference: callers (e.g. Slate's onChange) often wrap
  // the same content in a new object on every call (selection changes, cursor
  // syncs, etc.). Without stabilization, each new wrapper resets the debounce
  // timer via useEffect's Object.is dependency check, preventing the
  // validation error from ever appearing under load.
  const stableRef = useRef(value);
  if (!isEqual(value, stableRef.current)) {
    stableRef.current = value;
  }
  const stableValue = stableRef.current;

  const [debouncedValue, setDebouncedValue] = useState(stableValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(stableValue);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [stableValue, debounceMs]);

  const validationError = useMemo(() => {
    // Only show validation error when user has stopped typing (value matches debounced value)
    if (!isEqual(stableValue, debouncedValue)) {
      return undefined;
    }

    const validationErrorKey = getValidationErrorKey?.(debouncedValue) || null;
    if (validationErrorKey) {
      return translate(validationErrorKey);
    }

    return undefined;
  }, [stableValue, debouncedValue, translate, getValidationErrorKey]);

  return validationError;
}
