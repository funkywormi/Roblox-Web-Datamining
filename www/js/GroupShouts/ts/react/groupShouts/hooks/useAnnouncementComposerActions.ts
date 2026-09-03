import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import { refreshInlinePrompt } from '@rbx/prompts-orchestrator';
import announcementsService from '../services/announcementsService';
import { AnnouncementDraftModel, AnnouncementErrorResponseV2 } from '../types';
import { MessageContent } from '../../shared/types';
import { createMessageContentFragment } from '../../shared/utils/messageContentUtils';
import { logGroupPageClickEvent } from '../../shared/utils/logging';
import { EventContext as SharedEventContext } from '../../shared/constants/eventConstants';
import queryKeys from '../utils/queryKeys';
import { getErrorKey } from '../utils/composerErrors';
import { ComposerMode } from './useComposerMode';

export type UseAnnouncementComposerActionsOptions = {
  groupId: number;
  mode: ComposerMode;
  /** Current asset id, supplied by `useAnnouncementAssetUpload`. */
  assetId: number | null;
  /** Current attached poll form id, or null if none. */
  formId: number | null;
  /** User's opt-in for notifications on publish. */
  sendNotifications: boolean;
  /**
   * Whether the notifications opt-in is even surfaced (driven by guac config + mode). Only when
   * true do we forward `sendNotifications` to the API; otherwise we send `undefined` so the
   * server falls back to its default behavior.
   */
  shouldSendNotifications: boolean;
  /**
   * Invoked after a successful draft save with the exact values the user submitted —
   * including the asset id snapshot taken at submit time. Consumers pin the dirty-tracking
   * baseline from these values so it matches what was sent to the server (rather than the
   * current editor mirrors, which may have drifted between submit and resolution — e.g. the
   * user uploaded a new image while save was in flight).
   */
  onDraftSaved?: (input: {
    submittedTitle: string;
    submittedContent: string;
    submittedSlate: string;
    submittedAssetId: number | null;
    submittedFormId: number | null;
  }) => void;
  /**
   * Invoked with the new announcement's id after a successful `onPublish`. Used by the
   * section container to update the id that the display queries against, so it refetches
   * the just-published announcement rather than the previous one.
   */
  onPublished?: (announcementId: string) => void;
};

export type SavePayload = {
  title: string;
  content: MessageContent;
};

export type UseAnnouncementComposerActionsResult = {
  /**
   * Submits the editor. Returns whether `TextContentEditor` should `resetForm()` after — we
   * return `true` only for the edit-published path (where we navigate away anyway); for draft
   * saves we keep the user's text visible because dirty-tracking lives outside the editor.
   */
  onSave: (input: SavePayload) => Promise<boolean>;
  onPublish: () => Promise<void>;
  isSaving: boolean;
  isPublishing: boolean;
  /** Translation key for the most recent save/publish failure, or null. */
  errorKey: string | null;
  /** Clear `errorKey` (typically called from the editor's `onChange`). */
  resetErrorKey: () => void;
};

/**
 * Owns the three composer mutations (`saveEdit`, `saveDraft`, `publishDraft`) plus their
 * orchestration: error mapping, query-cache updates, and post-success navigation. The
 * component is left with a flat `onSave` / `onPublish` surface and never touches a mutation
 * directly.
 */
export const useAnnouncementComposerActions = ({
  groupId,
  mode,
  assetId,
  formId,
  sendNotifications,
  shouldSendNotifications,
  onDraftSaved,
  onPublished
}: UseAnnouncementComposerActionsOptions): UseAnnouncementComposerActionsResult => {
  const history = useHistory();
  const queryClient = useQueryClient();
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const resetErrorKey = useCallback(() => {
    setErrorKey(null);
  }, []);

  // `assetId = 0` is the server contract for "remove the image"; null from the hook means
  // the user hasn't touched the field, which we forward as `undefined` so the request omits
  // it entirely.
  const toPayloadAssetId = (value: number | null): number | undefined => value ?? undefined;

  // Drafts use `0` as the server contract for "remove the attached poll". A null from the
  // hook means the user cleared (or never attached) a poll, which on a draft save we encode
  // as `0` so the server clears any previously-saved poll.
  const toDraftFormId = (value: number | null): number => value ?? 0;

  const saveEdit = useMutation({
    mutationFn: async ({
      content,
      assetId: submittedAssetId
    }: {
      content: MessageContent;
      assetId: number | null;
    }) => {
      logGroupPageClickEvent({
        groupId,
        clickTargetType: 'submitEditAnnouncement',
        context: SharedEventContext.GroupHomepage
      });

      if (mode.kind !== 'editPublished') {
        throw new Error('saveEdit requires editPublished mode');
      }

      const contentFragment = createMessageContentFragment(content);
      await announcementsService.updateAnnouncement(groupId, mode.announcement.id, {
        ...contentFragment,
        assetId: toPayloadAssetId(submittedAssetId)
      });
    }
  });

  const saveDraft = useMutation({
    mutationFn: async ({
      title,
      content,
      assetId: submittedAssetId,
      formId: submittedFormId
    }: {
      title: string;
      content: MessageContent;
      assetId: number | null;
      formId: number | null;
    }): Promise<AnnouncementDraftModel | null> => {
      logGroupPageClickEvent({
        groupId,
        clickTargetType: 'saveDraftAnnouncement',
        context: SharedEventContext.GroupHomepage
      });

      const contentFragment = createMessageContentFragment(content);

      // Drive the create-vs-update branch off the mode (which is fed by the cached drafts
      // query). This avoids the "savedDraft not yet hydrated from existingDraft" race the
      // pre-decomposition code papered over with `savedDraft ?? existingDraft`.
      if (mode.kind === 'editDraft') {
        const draftId = mode.draft.id;
        // For drafts, `0` is the server contract for "remove the attached poll"; a positive
        // number sets/replaces the poll. We never omit the field here because we always know
        // the user's current intent for the attached poll on a draft save.
        await announcementsService.updateAnnouncement(groupId, draftId, {
          title,
          ...contentFragment,
          assetId: toPayloadAssetId(submittedAssetId),
          formId: toDraftFormId(submittedFormId)
        });
        return announcementsService.findDraftInUserDrafts(groupId, draftId);
      }

      return announcementsService.createDraft(groupId, {
        title,
        content: content.plainText || '',
        slate: contentFragment.slate,
        assetId: toPayloadAssetId(submittedAssetId),
        formId: submittedFormId ?? undefined
      });
    }
  });

  const publishDraft = useMutation({
    mutationFn: async ({ draftId }: { draftId: string }) => {
      logGroupPageClickEvent({
        groupId,
        clickTargetType: 'publishAnnouncement',
        context: SharedEventContext.GroupHomepage
      });

      return announcementsService.publishDraft(
        groupId,
        draftId,
        shouldSendNotifications ? sendNotifications : undefined
      );
    }
  });

  const onSave = useCallback(
    async ({ title, content }: SavePayload): Promise<boolean> => {
      const titleText = title;
      // Snapshot the asset id and form id at submit time. Subsequent edits during the
      // in-flight save must not influence what gets sent to the server nor what the
      // baseline is pinned to.
      const submittedAssetId = assetId;
      const submittedFormId = formId;
      try {
        if (mode.kind === 'editPublished') {
          // `formId` is not forwarded — the attached poll cannot change once published.
          await saveEdit.mutateAsync({
            content,
            assetId: submittedAssetId
          });
          // eslint-disable-next-line no-void
          void queryClient.invalidateQueries(queryKeys.getGroupLatestAnnouncementKey(groupId));
          history.goBack();
          return true;
        }

        const draft = await saveDraft.mutateAsync({
          title: titleText,
          content,
          assetId: submittedAssetId,
          formId: submittedFormId
        });
        // Only push a fresh draft into the cache when we actually got one back — a null lookup
        // miss lets the existing cache entry stand until `invalidateQueries` corrects it.
        if (draft) {
          queryClient.setQueryData<AnnouncementDraftModel | null>(
            queryKeys.getUserDraftsKey(groupId),
            draft
          );
          onDraftSaved?.({
            submittedTitle: titleText,
            submittedContent: content.plainText || '',
            submittedSlate: content.slate ? JSON.stringify(content.slate) : '',
            submittedAssetId,
            submittedFormId
          });
        }
        // eslint-disable-next-line no-void
        void queryClient.invalidateQueries(queryKeys.getUserDraftsKey(groupId));
        // Return false so `TextContentEditor` does not `resetForm()` — the user's text must
        // remain visible; dirty-state is tracked outside the editor.
        return false;
      } catch (error: unknown) {
        setErrorKey(getErrorKey(error as AnnouncementErrorResponseV2));
      }
      return false;
    },
    [mode, assetId, formId, saveEdit, saveDraft, queryClient, groupId, history, onDraftSaved]
  );

  const draftIdForPublish = mode.kind === 'editDraft' ? mode.draft.id : null;

  const onPublish = useCallback(async (): Promise<void> => {
    if (!draftIdForPublish) return;
    try {
      const published = await publishDraft.mutateAsync({ draftId: draftIdForPublish });
      // Hand the new announcement's id back to the section container so the display's
      // `announcementsData.id`-derived queryKey changes and it refetches for the new one.
      onPublished?.(published.id);
      // eslint-disable-next-line no-void
      void queryClient.invalidateQueries(queryKeys.getGroupLatestAnnouncementKey(groupId));
      // eslint-disable-next-line no-void
      void refreshInlinePrompt('CommunityPageOpen', { groupId: String(groupId) });
      history.goBack();
    } catch (error: unknown) {
      setErrorKey(getErrorKey(error as AnnouncementErrorResponseV2));
    }
  }, [draftIdForPublish, publishDraft, queryClient, groupId, history, onPublished]);

  return {
    onSave,
    onPublish,
    isSaving: saveDraft.isLoading || saveEdit.isLoading,
    isPublishing: publishDraft.isLoading,
    errorKey,
    resetErrorKey
  };
};
