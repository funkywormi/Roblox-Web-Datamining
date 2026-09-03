/**
 * The API returns one of the strings below (or omits the field entirely). We use the same
 * strings as our internal enum so parsing is just "is the raw value one we know?".
 */
export enum DraftModerationState {
  Unknown = 'Unknown',
  Approved = 'Approved',
  Pending = 'PendingReview',
  Rejected = 'AssetRejected'
}

const KNOWN_STATES = new Set<string>(Object.values(DraftModerationState));

export const parseDraftModerationState = (raw?: string | null): DraftModerationState =>
  raw && KNOWN_STATES.has(raw) ? (raw as DraftModerationState) : DraftModerationState.Unknown;

export const isDraftModerationApproved = (state: DraftModerationState): boolean =>
  state === DraftModerationState.Approved;

export const isDraftModerationPending = (state: DraftModerationState): boolean =>
  state === DraftModerationState.Pending;

export const isDraftModerationRejected = (state: DraftModerationState): boolean =>
  state === DraftModerationState.Rejected;

/**
 * Publish is allowed when moderation is explicitly approved, OR the draft has no media and
 * the API omitted the moderation state (text-only drafts don't go through asset moderation).
 */
export const canPublishDraftByModeration = (
  draft: { assetId?: number } | null | undefined,
  state: DraftModerationState
): boolean => {
  if (isDraftModerationApproved(state)) {
    return true;
  }
  return draft?.assetId == null && state === DraftModerationState.Unknown;
};
