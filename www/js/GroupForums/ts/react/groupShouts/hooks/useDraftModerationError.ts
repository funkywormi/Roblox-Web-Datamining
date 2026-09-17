import { useCallback, useEffect, useState } from 'react';
import { isDraftModerationRejected, parseDraftModerationState } from '../utils/draftModeration';
import { ASSET_MODERATION_REJECTED_KEY, NETWORK_ERROR_KEY } from '../utils/composerErrors';
import { ComposerMode } from './useComposerMode';

export type UseDraftModerationErrorOptions = {
  /** Current composer mode. The hook only seeds errors when `mode.kind === 'editDraft'`. */
  mode: ComposerMode;
  /**
   * True when moderation polling has exceeded its timeout. Surfaced here (rather than as a
   * separate source in the composer) so the existing dismiss/re-seed pipeline and the
   * orchestration-cancel effect — which reads `moderationError.errorKey` — pick it up
   * automatically.
   */
  isModerationTimedOut?: boolean;
};

export type UseDraftModerationErrorResult = {
  /**
   * Translation key of the moderation error to surface, or null. Re-seeded each time the
   * cached draft object identity changes (i.e. on every `setQueryData` or refetch). Callers
   * can `clearErrorKey()` to dismiss; the dismissal persists across renders that don't update
   * the cache (e.g. the user typing) and is overridden the next time a fresh draft arrives.
   */
  errorKey: string | null;
  clearErrorKey: () => void;
};

/**
 * Owns the asset-moderation error key with dismiss-then-re-seed semantics.
 *
 * Why a hook and not inline state in the component: the seed-vs-dismiss interaction has three
 * subtle requirements (re-seed on cache identity change, persist dismissal across cache-noop
 * renders, sync to mode transitions) that are easier to test in isolation than mixed in with
 * the rest of the composer's state.
 */
export const useDraftModerationError = ({
  mode,
  isModerationTimedOut = false
}: UseDraftModerationErrorOptions): UseDraftModerationErrorResult => {
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const clearErrorKey = useCallback(() => {
    setErrorKey(null);
  }, []);

  const draft = mode.kind === 'editDraft' ? mode.draft : null;

  // Identity-based dependency: re-seed whenever the cached draft is replaced (save, refetch),
  // not on every render. Renders that don't change the cache (the user typing) do not re-fire.
  // Timeout takes precedence over Rejected (in practice they can't co-occur: a draft that
  // times out in Pending hasn't reached Rejected, and Rejected is terminal).
  useEffect(() => {
    if (isModerationTimedOut) {
      setErrorKey(NETWORK_ERROR_KEY);
      return;
    }
    if (!draft) {
      setErrorKey(null);
      return;
    }
    const state = parseDraftModerationState(draft.moderationState);
    if (isDraftModerationRejected(state)) {
      setErrorKey(ASSET_MODERATION_REJECTED_KEY);
    } else {
      setErrorKey(null);
    }
  }, [draft, isModerationTimedOut]);

  return { errorKey, clearErrorKey };
};
