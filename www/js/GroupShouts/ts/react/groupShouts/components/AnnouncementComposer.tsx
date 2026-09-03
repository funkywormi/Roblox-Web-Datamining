import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSystemFeedback } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Checkbox } from '@rbx/foundation-ui';
import { ThumbnailAssetsSize } from 'roblox-thumbnails';
import { groupAnnouncementsConfig } from '../translation.config';
import TextContentEditor from '../../shared/components/content/TextContentEditor';
import FileUpload from '../../shared/components/fileUpload/FileUpload';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import groupAnnouncementsConsts from '../constants/groupAnnouncementsConstants';
import {
  GetAnnouncementTitleValidationErrorKey,
  GetAnnouncementContentValidationErrorKey
} from '../utils/validation';
import { isDraftModerationPending, parseDraftModerationState } from '../utils/draftModeration';
import { isModerationErrorKey, ASSET_MODERATION_REJECTED_KEY } from '../utils/composerErrors';
import { isSaveDisabled, isPublishDisabled, canPublishNow } from '../utils/composerSelectors';
import { MessageContent } from '../../shared/types';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import AnnouncementFooterControls from './AnnouncementFooterControls';
import {
  useComposerMode,
  editorSourceFromMode,
  editorKeyFromMode,
  getExistingFormId
} from '../hooks/useComposerMode';
import { useAnnouncementAssetUpload } from '../hooks/useAnnouncementAssetUpload';
import { useDirtyTracking } from '../hooks/useDirtyTracking';
import { useDraftModerationError } from '../hooks/useDraftModerationError';
import { useAnnouncementComposerActions } from '../hooks/useAnnouncementComposerActions';
import { useAnnouncementTracking } from '../hooks/useAnnouncementTracking';
import MetricsElement from '../../shared/components/MetricsElement';
import { CommunityMetric, getImpressionId } from '../../shared/utils/eventStream';
import PollSection from '../../customForms/components/PollSection';
import { useAnnouncementPollsEnabled } from '../hooks/useAnnouncementPollsEnabled';

export type AnnouncementComposerProps = {
  groupId: number;
  /**
   * Called with the newly-published announcement's id after a successful publish. Consumers
   * (e.g. `GroupAnnouncementsSection`) use this to update the id that
   * `GroupAnnouncementsDisplay` queries against.
   */
  onPublished?: (announcementId: string) => void;
} & WithTranslationsProps;

const AnnouncementComposer: React.FC<AnnouncementComposerProps> = ({
  groupId,
  onPublished,
  translate
}) => {
  const history = useHistory();
  const { SystemFeedbackComponent } = useSystemFeedback();
  const { isLoading: isGuacLoading, data: groupDetailsUi } = useGuacConfig('group-details-ui');

  const tracking = useAnnouncementTracking({ groupId });

  const { mode, isDraftsLoading, isModerationTimedOut } = useComposerMode(groupId);
  const editorSource = useMemo(() => editorSourceFromMode(mode), [mode]);
  const isEditingPublished = mode.kind === 'editPublished';

  const isPollsEnabled = useAnnouncementPollsEnabled();
  const { features } = useCommunityProductFeatures();
  const existingFormId = getExistingFormId(mode);
  const initialFormId: number | null = existingFormId ?? null;
  const [formId, setFormId] = useState<number | null>(initialFormId);

  const formIdHydratedRef = useRef<boolean>(mode.kind !== 'loading');
  useEffect(() => {
    if (formIdHydratedRef.current) return;
    if (mode.kind === 'loading') return;
    formIdHydratedRef.current = true;
    setFormId(initialFormId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode.kind]);

  const showNotificationsCheckbox =
    !isGuacLoading &&
    !isEditingPublished &&
    !!groupDetailsUi?.displayOptionalAnnouncementNotificationsCheckbox;

  const [sendNotifications, setSendNotifications] = useState(false);

  // Editor mirrors. The editor owns its own `useStatefulForm`; we mirror via `onChange` so the
  // dirty-tracking hook has a single comparable snapshot for both text and asset state.
  const [currentTitle, setCurrentTitle] = useState<string>(editorSource.title);
  const [currentContent, setCurrentContent] = useState<MessageContent>(editorSource.content);

  // "Touched" = the user has interacted with this field at least once (or it was pre-populated
  // from an existing draft / published announcement). Once touched, empty values become a
  // validation error, which both unblocks the inline error display and disables Save/Publish
  // until the field is populated again. Before touch, an empty field is treated as neutral —
  // matching the desired "no red error on a blank new form" UX.
  const [titleTouched, setTitleTouched] = useState<boolean>(() => editorSource.title.length > 0);
  const [contentTouched, setContentTouched] = useState<boolean>(
    () => (editorSource.content.plainText || '').length > 0
  );

  const asset = useAnnouncementAssetUpload({ initialAssetId: editorSource.imageAssetId });

  const currentSlateKey = currentContent.slate ? JSON.stringify(currentContent.slate) : '';
  const initialSlateKey = editorSource.content.slate
    ? JSON.stringify(editorSource.content.slate)
    : '';

  const dirty = useDirtyTracking({
    current: {
      title: currentTitle,
      content: currentContent.plainText || '',
      slate: currentSlateKey,
      assetId: asset.assetId,
      formId
    },
    initial: {
      title: editorSource.title,
      content: editorSource.content.plainText || '',
      slate: initialSlateKey,
      assetId: editorSource.imageAssetId,
      formId: initialFormId
    }
  });

  // When mode resolves asynchronously (loading -> editDraft / newDraft) we hydrate the editor
  // mirrors from the freshly resolved source AND re-pin the dirty-tracking baseline so the
  // initial values do not register as "changes".
  const hydratedRef = useRef<boolean>(mode.kind !== 'loading');
  useEffect(() => {
    if (hydratedRef.current) return;
    if (mode.kind === 'loading') return;
    hydratedRef.current = true;
    setCurrentTitle(editorSource.title);
    setCurrentContent(editorSource.content);
    dirty.commit({
      title: editorSource.title,
      content: editorSource.content.plainText || '',
      slate: editorSource.content.slate ? JSON.stringify(editorSource.content.slate) : '',
      assetId: editorSource.imageAssetId,
      formId: initialFormId
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode.kind, editorSource, dirty]);

  const { pathname } = useLocation();

  const createPageShownMetric = useMemo(
    () =>
      CommunityMetric.AnnouncementCreatePageShown({
        pageRoute: pathname,
        locationTab: 'announcements',
        groupId,
        sessionId: getImpressionId(),
        draftId: mode.kind === 'editDraft' ? mode.draft.id : ''
      }),
    [pathname, groupId, mode]
  );

  const moderationError = useDraftModerationError({ mode, isModerationTimedOut });

  // Polling is now driven by `useQuery({ refetchInterval })` inside `useComposerMode`. The UI
  // signal "are we still waiting for moderation" is therefore just "is the cached draft state
  // currently Pending?"; if it is, the next refetch is already scheduled.
  const isModerationPolling =
    mode.kind === 'editDraft' &&
    isDraftModerationPending(parseDraftModerationState(mode.draft.moderationState));

  const onDraftSaved = useCallback(
    ({
      submittedTitle,
      submittedContent,
      submittedSlate,
      submittedAssetId,
      submittedFormId
    }: {
      submittedTitle: string;
      submittedContent: string;
      submittedSlate: string;
      submittedAssetId: number | null;
      submittedFormId: number | null;
    }) => {
      dirty.commit({
        title: submittedTitle,
        content: submittedContent,
        slate: submittedSlate,
        assetId: submittedAssetId,
        formId: submittedFormId
      });
    },
    [dirty]
  );

  const actions = useAnnouncementComposerActions({
    groupId,
    mode,
    assetId: asset.assetId,
    formId,
    sendNotifications,
    shouldSendNotifications: showNotificationsCheckbox,
    onDraftSaved,
    onPublished
  });

  // Mirror the latest editor/touched state into a ref so `onChange` can read them without
  // listing them as dependencies — otherwise the callback re-creates every keystroke, which
  // cascades through the editor's memoized subtree.
  const latestComposerStateRef = useRef({
    currentTitle,
    currentContent,
    titleTouched,
    contentTouched
  });
  useEffect(() => {
    latestComposerStateRef.current = {
      currentTitle,
      currentContent,
      titleTouched,
      contentTouched
    };
  });

  // Publish-intent orchestration: arming this flag causes the effect below to fire
  // actions.onPublish() once the draft is saved and moderation is satisfied.
  const [publishIntent, setPublishIntent] = useState(false);
  // Tracks the armed state synchronously — including the window during an in-flight save
  // before `publishIntent` state flips to true. Managed explicitly (not mirrored from state)
  // so a mid-save edit in `onChange` can cancel the pending intent before it ever arms.
  const publishIntentRef = useRef(false);

  const { errorKey: actionsErrorKey, resetErrorKey } = actions;
  // Ref mirror so commitPublishIntent can check for a save error after the async await without
  // listing actionsErrorKey as a closure dependency (which would recreate the callback on every
  // error-state change).
  const actionsErrorKeyRef = useRef(actionsErrorKey);
  useEffect(() => {
    actionsErrorKeyRef.current = actionsErrorKey;
  });
  const { errorKey: moderationErrorKeyValue, clearErrorKey } = moderationError;

  const onChange = useCallback(
    ({ title, content }: { title: string; content: MessageContent }) => {
      const latest = latestComposerStateRef.current;
      // Only flip the corresponding touched flag when THIS field actually changed — the
      // editor's per-field `onChange` handlers pass the untouched field's prior value
      // through unchanged, so a comparison against the latest mirror is sufficient.
      if (title !== latest.currentTitle && !latest.titleTouched) setTitleTouched(true);
      const prevPlain = latest.currentContent.plainText || '';
      const nextPlain = content.plainText || '';
      if (nextPlain !== prevPlain && !latest.contentTouched) {
        setContentTouched(true);
      }
      setCurrentTitle(title);
      setCurrentContent(content);
      if (actionsErrorKey) resetErrorKey();
      if (moderationErrorKeyValue) clearErrorKey();
      // User editing cancels any armed publish intent — including one that is mid-save,
      // where the ref is true but state has not yet flipped.
      if (publishIntentRef.current) {
        publishIntentRef.current = false;
        setPublishIntent(false);
      }
    },
    [actionsErrorKey, moderationErrorKeyValue, resetErrorKey, clearErrorKey]
  );

  // Touched-aware validators. Once a field has been touched, an empty value returns the
  // min-length error key — circumventing `validateStringLength`'s default `ignoreEmpty`
  // behaviour so typing-then-clearing surfaces the same error as "too short".
  const getTitleError = useCallback(
    (value: MessageContent): string | undefined => {
      const plain = (value.plainText ?? '').trim();
      if (titleTouched && plain.length === 0) {
        return 'Error.AnnouncementTitleValidationMinLength';
      }
      return GetAnnouncementTitleValidationErrorKey(value);
    },
    [titleTouched]
  );

  const getContentError = useCallback(
    (value: MessageContent): string | undefined => {
      if (contentTouched && !value.slate && (value.plainText ?? '').trim().length === 0) {
        return 'Error.AnnouncementContentValidationMinLength';
      }
      return GetAnnouncementContentValidationErrorKey(value);
    },
    [contentTouched]
  );

  const isFormInvalid = useMemo(() => {
    const titleValue = { plainText: currentTitle };
    if ((currentTitle ?? '').trim().length === 0) return true;
    if (!currentContent.slate && (currentContent.plainText || '').trim().length === 0) return true;
    return (
      !!GetAnnouncementTitleValidationErrorKey(titleValue) ||
      !!GetAnnouncementContentValidationErrorKey(currentContent)
    );
  }, [currentTitle, currentContent]);

  const onBack = useCallback(() => {
    tracking.trackCreatePageButtonClick({
      buttonClicked: 'cancel',
      isImageAttached: asset.assetId != null
    });
    history.goBack();
  }, [history, tracking, asset.assetId]);

  const displayedErrorKey = actions.errorKey || asset.errorKey || moderationError.errorKey || '';

  const bannerShownMetric = useMemo(
    () =>
      displayedErrorKey
        ? CommunityMetric.AnnouncementCreatePageBannerMessageShown({
            pageRoute: pathname,
            locationTab: 'announcements',
            groupId,
            sessionId: getImpressionId(),
            bannerMessageShown: displayedErrorKey
          })
        : null,
    [displayedErrorKey, pathname, groupId]
  );

  const draftForModeration = mode.kind === 'editDraft' ? mode.draft : null;
  const draftModerationState = parseDraftModerationState(draftForModeration?.moderationState);

  const isModerationError =
    isModerationErrorKey(actions.errorKey) ||
    moderationError.errorKey === ASSET_MODERATION_REJECTED_KEY;

  const commitPublishIntent = useCallback(async (): Promise<void> => {
    tracking.trackCreatePageButtonClick({
      buttonClicked: 'post',
      isImageAttached: asset.assetId != null
    });

    // A Publish click is an explicit retry; drop any stale transient error so the
    // orchestration effect doesn't immediately cancel the intent we're about to arm.
    if (actionsErrorKeyRef.current) resetErrorKey();

    // Arm the ref synchronously so a mid-save edit via `onChange` can cancel the intent
    // before state ever flips to true — otherwise an edit during the in-flight save would
    // see `publishIntentRef.current === false`, pass through, and strand the UI with
    // both buttons disabled after save resolves (publishIntent=true + dirty=true).
    publishIntentRef.current = true;

    const needsSave = mode.kind === 'newDraft' || dirty.hasChanges;
    if (needsSave) {
      await actions.onSave({
        title: currentTitle,
        content: currentContent
      });

      if (actionsErrorKeyRef.current) {
        publishIntentRef.current = false;
        return;
      }
    }
    if (!publishIntentRef.current) return;
    setPublishIntent(true);
  }, [
    tracking,
    asset.assetId,
    mode.kind,
    dirty.hasChanges,
    actions,
    currentTitle,
    currentContent,
    resetErrorKey
  ]);

  const { onPublish } = actions;

  // Fires `actions.onPublish()` exactly once after a publish intent is armed, the draft is
  // saved and clean, moderation permits publishing, and no error is pending. Any banner error
  // cancels the intent.
  useEffect(() => {
    if (!publishIntent) return;

    if (actions.errorKey || moderationError.errorKey) {
      publishIntentRef.current = false;
      setPublishIntent(false);
      return;
    }

    if (dirty.hasChanges) return;
    if (mode.kind !== 'editDraft') return;
    if (isModerationPolling) return;
    if (actions.isPublishing) return;

    if (
      !canPublishNow({
        draftForModeration,
        draftModerationState,
        hasAssetModerationError: false,
        isModerationPolling
      })
    ) {
      return;
    }

    publishIntentRef.current = false;
    setPublishIntent(false);
    // eslint-disable-next-line no-void
    void onPublish();
  }, [
    publishIntent,
    mode,
    dirty.hasChanges,
    isModerationPolling,
    draftModerationState,
    draftForModeration,
    moderationError.errorKey,
    actions.errorKey,
    actions.isPublishing,
    onPublish
  ]);

  const onSave = useCallback(
    (payload: { title: string; content: MessageContent }) => {
      tracking.trackCreatePageButtonClick({
        buttonClicked: 'save',
        isImageAttached: asset.assetId != null
      });
      return actions.onSave(payload);
    },
    [actions, tracking, asset.assetId]
  );

  const saveDisabled = isSaveDisabled({
    hasUnsavedChanges: dirty.hasChanges,
    isUploadingAsset: asset.isUploading,
    isDraftsLoading,
    isModerationError,
    isInvalid: isFormInvalid,
    publishIntent
  });

  const publishDisabled = isPublishDisabled({
    modeKind: mode.kind,
    isUploadingAsset: asset.isUploading,
    isPublishing: actions.isPublishing,
    isSaving: actions.isSaving,
    isModerationPolling,
    hasAssetModerationError: !!moderationError.errorKey,
    isInvalid: isFormInvalid,
    publishIntent
  });

  const editorKey = editorKeyFromMode(mode);

  const defaultContentValue = useMemo(() => editorSource.content, [editorSource.content]);

  // True when the save button should surface "Saved" instead of a call-to-action label:
  // editDraft mode, no unsaved changes, no pending poll, no errors, moderation permits publishing.
  const canPublishExistingDraft =
    !isEditingPublished &&
    mode.kind === 'editDraft' &&
    !dirty.hasChanges &&
    !isModerationPolling &&
    !actions.errorKey &&
    canPublishNow({
      draftForModeration,
      draftModerationState,
      hasAssetModerationError: false,
      isModerationPolling
    });

  const saveButtonTextKey = useMemo(() => {
    if (isEditingPublished) return 'Action.Save';
    // A publishable draft has no unsaved changes — surface the "Saved" state on the button
    // instead of the call-to-action copy.
    if (canPublishExistingDraft) return 'Message.Saved';
    return 'Action.SaveDraft';
  }, [isEditingPublished, canPublishExistingDraft]);

  const composerControls = useMemo(
    () => (
      <AnnouncementFooterControls
        isSaveDisabled={saveDisabled}
        isSaveLoading={actions.isSaving}
        isPublishDisabled={publishDisabled}
        onPublish={commitPublishIntent}
        isEditingPublished={isEditingPublished}
      />
    ),
    [saveDisabled, actions.isSaving, publishDisabled, commitPublishIntent, isEditingPublished]
  );

  return (
    <div className='announcement-composer' data-testid='announcement-composer'>
      <MetricsElement
        metric={createPageShownMetric}
        isOneTimeEvent
        isReady={mode.kind !== 'loading'}
      />
      {bannerShownMetric && (
        <MetricsElement key={displayedErrorKey} metric={bannerShownMetric} isOneTimeEvent />
      )}
      <TextContentEditor
        key={editorKey}
        hasTitle
        headerText={translate(
          isEditingPublished ? 'Action.EditAnnouncement' : 'Action.CreateAnnouncement'
        )}
        contentPlaceholder={translate('Label.WriteSomething')}
        submitText={translate(saveButtonTextKey)}
        titleLabel={translate('Label.Title')}
        contentLabel={translate('Label.Content')}
        childLabel={translate('Label.Image')}
        defaultTitle={editorSource.title}
        titleMaxLength={groupAnnouncementsConsts.validation.titleMaxLength}
        defaultContent={defaultContentValue}
        contentMaxLength={groupAnnouncementsConsts.validation.contentMaxLength}
        titleLocked={isEditingPublished}
        errorKey={actions.errorKey || asset.errorKey || moderationError.errorKey}
        onSubmit={onSave}
        onChange={onChange}
        onBack={onBack}
        isLoading={mode.kind === 'loading'}
        getTitleValidationErrorKey={getTitleError}
        getContentValidationErrorKey={getContentError}
        useInlineProgressIndicator
        inlineProgressVisible={isModerationPolling && !isModerationTimedOut}
        inlineProgressText={translate('Label.AnnouncementProcessing')}
        isRichTextEnabled={features.AnnouncementsRichTextWrite}
        footerControls={composerControls}>
        <div className='announcement-composer-file-upload'>
          <FileUpload
            key={asset.resetKey}
            dragFileTextKey='Label.DragImage'
            onChange={asset.selectFiles}
            onRemove={asset.removeImage}
            previewAssetId={asset.assetId}
            validation={asset.validation}
            displayDimensions={ThumbnailAssetsSize.width930}
            blockOnValidationError
            isUploading={asset.isUploading}
          />
        </div>
        {isPollsEnabled && (
          <PollSection
            groupId={groupId}
            vertical={groupAnnouncementsConsts.customFormsVertical}
            existingFormId={existingFormId}
            isReadOnly={mode.kind === 'editPublished'}
            onPollCreated={setFormId}
            onPollRemoved={() => setFormId(null)}
            translate={translate}
          />
        )}
        {showNotificationsCheckbox && (
          <Checkbox
            className='margin-top-small'
            isChecked={sendNotifications}
            onCheckedChange={isChecked => setSendNotifications(isChecked === true)}
            label={translate('Label.SendAnnouncementNotifications')}
            placement='Start'
            size='XSmall'
          />
        )}
      </TextContentEditor>
      <SystemFeedbackComponent />
    </div>
  );
};

AnnouncementComposer.displayName = 'AnnouncementComposer';

export default withTranslations(AnnouncementComposer, groupAnnouncementsConfig);
