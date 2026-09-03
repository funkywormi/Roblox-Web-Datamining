import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import announcementsService from '../services/announcementsService';
import {
  AnnouncementDraftModel,
  AnnouncementModel,
  AnnouncementsPageResponse,
  LocationState
} from '../types';
import { MessageContent } from '../../shared/types';
import queryKeys from '../utils/queryKeys';
import { isDraftModerationPending, parseDraftModerationState } from '../utils/draftModeration';

/** Refetch interval (ms) used while a draft is in `Pending` asset moderation. */
export const MODERATION_POLL_INTERVAL_MS = 2500;

/**
 * Maximum time we will keep polling a draft stuck in `Pending` moderation before we give up,
 * stop polling, and surface a timeout error. Scoped to the current mount — reloading the page
 * while Pending starts a fresh 5-minute window.
 */
export const MODERATION_POLL_TIMEOUT_MS = 5 * 60 * 1000;

/** Pure predicate backing drafts-query `refetchInterval`; exported for unit tests. */
export const moderationRefetchInterval = (
  data: AnnouncementDraftModel | null | undefined
): number | false => {
  const state = parseDraftModerationState(data?.moderationState);
  return isDraftModerationPending(state) ? MODERATION_POLL_INTERVAL_MS : false;
};

/**
 * The four user-facing modes the composer can be in. Code that branches on mode should
 * `switch (mode.kind)` so the type narrows the data shape automatically.
 */
export type ComposerMode =
  | { kind: 'loading' }
  | { kind: 'newDraft' }
  | { kind: 'editDraft'; draft: AnnouncementDraftModel }
  | { kind: 'editPublished'; announcement: AnnouncementModel };

export const getExistingFormId = (mode: ComposerMode): number | undefined => {
  switch (mode.kind) {
    case 'editPublished':
      return mode.announcement.formId;
    case 'editDraft':
      return mode.draft.formId;
    default:
      return undefined;
  }
};

export type EditorSource = {
  title: string;
  content: MessageContent;
  imageAssetId: number | null;
};

export const editorSourceFromMode = (mode: ComposerMode): EditorSource => {
  switch (mode.kind) {
    case 'editPublished':
      return {
        title: mode.announcement.originalTitle,
        content: mode.announcement.originalContent,
        imageAssetId: mode.announcement.imageAssetId ?? null
      };
    case 'editDraft':
      return {
        title: mode.draft.title,
        content: mode.draft.content,
        imageAssetId: mode.draft.assetId ?? null
      };
    case 'newDraft':
    case 'loading':
    default:
      return { title: '', content: { plainText: '' }, imageAssetId: null };
  }
};

/**
 * Stable key for `<TextContentEditor key={...}>`. The only valid remount triggers are:
 *   1. The initial hydration when `loading` resolves (so `defaultTitle`/`defaultContent` flow
 *      into the editor's internal state).
 *   2. Switching between two different published announcements (rare; same component instance,
 *      different entity).
 *
 * `newDraft` and `editDraft` deliberately share `'composing'`: when the user saves their first
 * draft, `mode` transitions `newDraft → editDraft`, but the editor's content (and the
 * `<FileUpload>` child's `localPreviewSrc`) MUST persist — otherwise the just-uploaded image
 * preview is replaced by `<Thumbnail2d>` rendering the draft's `imageAssetId`, which the
 * thumbnail service serves as a moderation placeholder while the draft is in `Pending`. Since
 * the `defaultTitle`/`defaultContent` props are only consumed at mount, sharing the key is safe:
 * the editor's internal state already matches the user's just-typed content.
 */
export const editorKeyFromMode = (mode: ComposerMode): string => {
  switch (mode.kind) {
    case 'editPublished':
      return `published:${mode.announcement.id}`;
    case 'editDraft':
    case 'newDraft':
      return 'composing';
    case 'loading':
    default:
      return 'loading';
  }
};

export type UseComposerModeResult = {
  mode: ComposerMode;
  isDraftsLoading: boolean;
  /**
   * True once the current draft has been in `Pending` moderation for longer than
   * `MODERATION_POLL_TIMEOUT_MS` on this mount. When true, the drafts query stops polling
   * and the composer should surface a timeout error to the user.
   */
  isModerationTimedOut: boolean;
};

/**
 * Resolves the composer's mode from `react-router` `LocationState` and the user's drafts query.
 *
 * - If `location.state.announcement` is present, the user navigated in to edit a published
 *   announcement; we never query drafts in this case.
 * - Otherwise we run the drafts query. While it is initial-loading, mode is `loading`. Once it
 *   resolves, mode is `editDraft` (if a draft exists) or `newDraft` (empty state).
 *
 * Background refetches (after invalidation) keep `data` populated by default in TanStack Query,
 * so mode stays stable across save/poll cycles. Callers should not need a separate "latch".
 */
export const useComposerMode = (groupId: number): UseComposerModeResult => {
  const location = useLocation<LocationState>();
  const publishedAnnouncement = location.state?.announcement;

  // Deadline for the current stretch of `Pending` moderation. `null` while we're not polling.
  // A ref (not state) because the deadline doesn't need to trigger re-renders — the render
  // trigger is `isModerationTimedOut` flipping via the timer below. Persisting across renders
  // keeps the deadline stable while `existingDraft` identity churns on each refetch.
  const pollingDeadlineRef = useRef<number | null>(null);
  const [isModerationTimedOut, setIsModerationTimedOut] = useState(false);

  const {
    data: existingDraft,
    isFetchedAfterMount: isDraftsFresh
  } = useQuery<AnnouncementDraftModel | null>({
    queryKey: queryKeys.getUserDraftsKey(groupId),
    queryFn: async (): Promise<AnnouncementDraftModel | null> => {
      const fetchDrafts = announcementsService.getUserDrafts as (
        id?: number
      ) => Promise<AnnouncementsPageResponse<AnnouncementDraftModel>>;
      const page = await fetchDrafts(groupId);
      return page.data?.[0] ?? null;
    },
    enabled: !publishedAnnouncement,
    // Drive moderation polling off the same query rather than a hand-rolled `setInterval`.
    // While the draft is `Pending`, refetch every 2.5s. As soon as it transitions to a terminal
    // state (Approved / Rejected / Unknown), or there is no draft, the predicate returns `false`
    // and TanStack Query stops the loop. Once we've exceeded the timeout on this mount we also
    // short-circuit to `false` so polling stops even if the draft remains Pending.
    refetchInterval: (data: AnnouncementDraftModel | null | undefined) =>
      isModerationTimedOut ? false : moderationRefetchInterval(data),
    // Default; pinned explicitly so the intent is auditable. We deliberately do NOT poll when
    // the tab is in the background — saves API load and was an implicit improvement over the
    // old `setInterval`-based loop, which polled regardless of visibility.
    refetchIntervalInBackground: false,
    // Match the pre-decomposition behavior: a single fetch failure is non-fatal and the next
    // tick will retry. Without this, TanStack Query would burst-retry on failure.
    retry: false
  });

  const isDraftPending = isDraftModerationPending(
    parseDraftModerationState(existingDraft?.moderationState)
  );

  // Arm a timer when the draft transitions into Pending, clear when it leaves Pending. The
  // deadline is pinned on first entry so consecutive refetches during a Pending stretch keep
  // the same countdown rather than resetting every 2.5s.
  useEffect(() => {
    if (!isDraftPending) {
      pollingDeadlineRef.current = null;
      setIsModerationTimedOut(false);
      return undefined;
    }
    if (pollingDeadlineRef.current == null) {
      pollingDeadlineRef.current = Date.now() + MODERATION_POLL_TIMEOUT_MS;
    }
    const remaining = pollingDeadlineRef.current - Date.now();
    if (remaining <= 0) {
      setIsModerationTimedOut(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setIsModerationTimedOut(true), remaining);
    return () => window.clearTimeout(timer);
  }, [isDraftPending]);

  // Memoize mode so its reference is stable across renders that don't change inputs. Several
  // downstream hooks key effects off `mode.draft` object identity to re-seed error state on a
  // fresh cache write — that semantics breaks if mode is re-allocated every render.
  //
  // Gate the editDraft/newDraft decision on `isDraftsFresh` (= `isFetchedAfterMount`) rather
  // than `isLoading`. `isLoading` is false whenever the cache has *any* value, including a
  // stale entry from a previous mount — e.g. a draft that the user later published and
  // deleted the resulting announcement. Treating stale cache as authoritative would hydrate
  // the composer with the ghost draft on "Create", and the downstream one-shot
  // `hydratedRef` in `AnnouncementComposer` never re-seeds when the refetch
  // corrects it. `isFetchedAfterMount` flips true only after a fetch completes on *this*
  // mount, then stays true across subsequent background refetches (moderation polling), so
  // `mode` doesn't flicker back to `loading` during polls.
  const mode = useMemo<ComposerMode>(() => {
    if (publishedAnnouncement) {
      return { kind: 'editPublished', announcement: publishedAnnouncement };
    }
    if (!isDraftsFresh) {
      return { kind: 'loading' };
    }
    if (existingDraft) {
      return { kind: 'editDraft', draft: existingDraft };
    }
    return { kind: 'newDraft' };
  }, [publishedAnnouncement, isDraftsFresh, existingDraft]);

  return {
    mode,
    isDraftsLoading: mode.kind === 'loading',
    isModerationTimedOut
  };
};
