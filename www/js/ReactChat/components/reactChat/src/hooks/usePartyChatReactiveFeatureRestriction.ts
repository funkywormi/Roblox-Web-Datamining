import { useEffect, useRef } from "react";
import {
  buildModerationTimeoutMap,
  type TChatModerationStatusesResponse,
} from "../adapters/chatModerationAdapters";

type TUsePartyChatReactiveFeatureRestrictionOptions = {
  /** When isEligible becomes false, the guard is reset so the next eligible session re-checks. */
  isEligible: boolean;
  /** Gets the current moderation statuses.*/
  refreshModerationStatuses: () => Promise<TChatModerationStatusesResponse | undefined>;
  /** Opens the party_chat UFR dialog. */
  showPartyChatFeatureRestriction: () => void;
};

/**
 * This isn't for the realtime path (aka user is online when the restriction is issued). This
 * is for the offline path (aka user is offline when the restriction is issued).  When the user
 * opens chat (either opens chat bar or uncollapses a conversation), it calls the server once to
 * check whether the user has a party-chat restriction to acknowledge. If there's something to
 * acknowledge and no UFR dialog is already open, it opens the UFR dialog.
 * */
export const usePartyChatReactiveFeatureRestriction = ({
  isEligible,
  refreshModerationStatuses,
  showPartyChatFeatureRestriction,
}: TUsePartyChatReactiveFeatureRestrictionOptions): void => {
  const hasCheckedRef = useRef(false);
  const refreshModerationStatusesRef = useRef(refreshModerationStatuses);
  refreshModerationStatusesRef.current = refreshModerationStatuses;
  const showPartyChatFeatureRestrictionRef = useRef(showPartyChatFeatureRestriction);
  showPartyChatFeatureRestrictionRef.current = showPartyChatFeatureRestriction;

  useEffect(() => {
    if (!isEligible) {
      // Reset so the next eligible session (opening chat again) makes a fresh call to the server.
      hasCheckedRef.current = false;
      return undefined;
    }
    if (hasCheckedRef.current) {
      // Already checked this session.
      return undefined;
    }

    hasCheckedRef.current = true;

    refreshModerationStatusesRef
      .current()
      .then(data => {
        // Derive the acknowledgment decision through the same adapter the input-blocking path uses
        // (buildModerationTimeoutMap), so both consumers interpret the payload identically — e.g. a
        // malformed range with requires_acknowledgement but an invalid end_time is rejected by both,
        // rather than auto-presenting a dialog while the input bar stays enabled.
        const userTimeout = data
          ? buildModerationTimeoutMap(data, new Date()).userTimedOutUntil
          : null;
        if (userTimeout?.requiresAcknowledgment) {
          showPartyChatFeatureRestrictionRef.current();
        }
      })
      // We only try getting moderation statuses once (don't retry on failure).
      .catch((): undefined => undefined);
  }, [isEligible]);
};

export default usePartyChatReactiveFeatureRestriction;
