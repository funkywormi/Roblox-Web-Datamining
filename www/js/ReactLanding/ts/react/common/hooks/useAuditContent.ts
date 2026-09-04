import { useEffect } from 'react';
import useAuditContentState, {
  AuditContentValue
} from '../../reactLanding/state/auditContentState';

/**
 * Custom hook to manage captured audit content in Zustand store
 * Uses two separate effects to optimize updates:
 * 1. Effect for adding/updating values (runs when key or value changes)
 * 2. Effect for cleanup (runs only when key changes or component unmounts)
 *
 * By splitting the effects, we can ensure that the cleanup effect only runs when the key changes or the component unmounts,
 * and the update effect only runs when the key or value changes. This prevents unnecessary re-renders and updates.
 *
 * @param key - The key to store the content under (if null/undefined, nothing is stored)
 * @param value - The value to store
 */
export const useCapturedAuditContent = (
  key: string | null | undefined,
  value: AuditContentValue | null
): void => {
  const { setCapturedAuditContentItem, removeCapturedAuditContentItem } = useAuditContentState();

  // Runs when key or value changes
  useEffect(() => {
    if (!key || !value) return;

    setCapturedAuditContentItem(key, value);

    // Zustand functions are stable and don't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  // Component unmounts or key changes (not when value changes)
  useEffect(() => {
    return () => {
      // This cleanup runs when:
      // - Component unmounts
      // - Key changes (cleanup happens before Effect 1 runs with new key)
      if (key) {
        removeCapturedAuditContentItem(key);
      }
    };

    // Zustand functions are stable and don't need to be in dependencies
    // Keeping key as a dependency here for future usescases if key will change while component is mounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};

/**
 * Custom hook to manage additional audit content in Zustand store
 * See useCapturedAuditContent for implementation details.
 *
 * @param key - The key to store the content under (if null/undefined, nothing is stored)
 * @param value - The value to store
 */
export const useAdditionalAuditContent = (key: string | null | undefined, value: string): void => {
  const {
    setAdditionalAuditContentItem,
    removeAdditionalAuditContentItem
  } = useAuditContentState();

  useEffect(() => {
    if (!key) return;
    setAdditionalAuditContentItem(key, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  useEffect(() => {
    return () => {
      if (key) {
        removeAdditionalAuditContentItem(key);
      }
    };
    // Dependency on key is necessary. For example in LegalCheckbox, when isChecked prop is changed, without dependency on `key` the cleanup effect will not run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};
