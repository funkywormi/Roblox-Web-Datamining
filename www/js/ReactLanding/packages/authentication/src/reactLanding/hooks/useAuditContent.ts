import { useEffect } from "react";
import useAuditContentState, { AuditContentValue } from "../state/auditContentState";

/**
 * Custom hook to manage captured audit content in Zustand store
 * Uses two separate effects to optimize updates:
 * 1. Effect for adding/updating values (runs when key or value changes)
 * 2. Effect for cleanup (runs only when key changes or component unmounts)
 *
 * By splitting the effects, we can ensure that the cleanup effect only runs when the key changes or the component unmounts,
 * and the update effect only runs when the key or value changes. This prevents unnecessary re-renders and updates.
 *
 * The effects read the store with getState() and do not subscribe to it, so a store change does not re-render the caller.
 *
 * @param key - The key to store the content under (if null/undefined, nothing is stored)
 * @param value - The value to store
 */
export const useCapturedAuditContent = (
  key: string | null | undefined,
  value: AuditContentValue | null,
): void => {
  // Runs when key or value changes
  useEffect(() => {
    if (!key || !value) return;

    useAuditContentState.getState().setCapturedAuditContentItem(key, value);
  }, [key, value]);

  // Component unmounts or key changes (not when value changes)
  useEffect(() => {
    return () => {
      // This cleanup runs when:
      // - Component unmounts
      // - Key changes (cleanup happens before Effect 1 runs with new key)
      if (key) {
        useAuditContentState.getState().removeCapturedAuditContentItem(key);
      }
    };
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
  useEffect(() => {
    if (!key) return;
    useAuditContentState.getState().setAdditionalAuditContentItem(key, value);
  }, [key, value]);

  useEffect(() => {
    return () => {
      if (key) {
        useAuditContentState.getState().removeAdditionalAuditContentItem(key);
      }
    };
    // Dependency on key is necessary. For example in LegalCheckbox, when isChecked prop is changed, without dependency on `key` the cleanup effect will not run
  }, [key]);
};
