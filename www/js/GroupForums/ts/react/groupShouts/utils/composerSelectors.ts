import { AnnouncementDraftModel } from '../types';
import { DraftModerationState, canPublishDraftByModeration } from './draftModeration';

export type ComposerModeKind = 'loading' | 'newDraft' | 'editDraft' | 'editPublished';

export type SaveDisabledInput = {
  hasUnsavedChanges: boolean;
  isUploadingAsset: boolean;
  isDraftsLoading: boolean;
  isModerationError: boolean;
  /**
   * Title or content currently fails validation — e.g. too-short after the user typed and
   * cleared. Computed at the composer level so this selector doesn't have to reach into the
   * editor's internal form-state.
   */
  isInvalid: boolean;
  /**
   * A publish orchestration is in progress. Save is disabled while intent is active to
   * prevent racey re-saves mid-flight.
   */
  publishIntent?: boolean;
};

/**
 * Save is disabled when there is nothing to save, an upload is mid-flight, drafts are still
 * loading, the content was moderated, any field currently fails validation, or a publish
 * orchestration is in progress. The in-flight save state is handled by the `isSaveLoading`
 * prop on the footer button (which also drives the loading spinner), so it is not duplicated here.
 */
export const isSaveDisabled = ({
  hasUnsavedChanges,
  isUploadingAsset,
  isDraftsLoading,
  isModerationError,
  isInvalid,
  publishIntent = false
}: SaveDisabledInput): boolean =>
  !hasUnsavedChanges ||
  isUploadingAsset ||
  isDraftsLoading ||
  isModerationError ||
  isInvalid ||
  publishIntent;

export type PublishDisabledInput = {
  modeKind: ComposerModeKind;
  isUploadingAsset: boolean;
  isPublishing: boolean;
  /**
   * A save mutation is in flight. `commitPublishIntent` arms `publishIntentRef` synchronously
   * and only flips `publishIntent` state after the awaited save resolves, so without this
   * gate a second click in that window would re-fire tracking, start a duplicate save, and
   * reset transient errors mid-flight.
   */
  isSaving: boolean;
  /**
   * The current draft is still in Pending asset moderation. Publish cannot complete until
   * moderation resolves, including polling that resumes on reload, so the button stays
   * disabled for the duration.
   */
  isModerationPolling: boolean;
  hasAssetModerationError: boolean;
  /** See `SaveDisabledInput.isInvalid`. Belt-and-suspenders on the publish path too. */
  isInvalid: boolean;
  /**
   * When true, a publish orchestration (Save → poll → Publish) is already in progress.
   * Publish is disabled until the current orchestration completes or is cancelled.
   */
  publishIntent: boolean;
};

/**
 * Publish is disabled in `editPublished` mode unconditionally (there is no publish action there),
 * while an orchestration is already running (`publishIntent`), while the form is invalid, while
 * an asset is uploading, while a save or publish mutation is in flight, while moderation
 * polling is active, or when there is an asset moderation error.
 *
 * Dirty state, draft existence, and moderation approval are intentionally NOT checked here —
 * those are orchestration concerns handled by the publish-intent effect in the component.
 */
export const isPublishDisabled = ({
  modeKind,
  isUploadingAsset,
  isPublishing,
  isSaving,
  isModerationPolling,
  hasAssetModerationError,
  isInvalid,
  publishIntent
}: PublishDisabledInput): boolean =>
  modeKind === 'editPublished' ||
  publishIntent ||
  isInvalid ||
  isUploadingAsset ||
  isSaving ||
  isPublishing ||
  isModerationPolling ||
  hasAssetModerationError;

export type CanPublishNowInput = {
  draftForModeration: Pick<AnnouncementDraftModel, 'assetId'> | null | undefined;
  draftModerationState: DraftModerationState;
  hasAssetModerationError: boolean;
  isModerationPolling: boolean;
};

/**
 * Returns true when the currently-cached draft is ready to publish from a moderation standpoint.
 * Used by the orchestration effect in the component to decide when to fire `actions.onPublish()`.
 *
 * Specifically: no asset moderation error, not polling, and the draft's moderation state
 * permits publishing (Approved, or text-only with Unknown state).
 */
export const canPublishNow = ({
  draftForModeration,
  draftModerationState,
  hasAssetModerationError,
  isModerationPolling
}: CanPublishNowInput): boolean => {
  if (hasAssetModerationError) return false;
  if (isModerationPolling) return false;
  return canPublishDraftByModeration(draftForModeration ?? null, draftModerationState);
};
