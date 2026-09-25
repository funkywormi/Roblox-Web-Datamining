import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useSystemFeedback } from 'react-style-guide';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { CurrentUser, Linkify } from 'Roblox';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import {
  Thumbnail2d,
  ThumbnailAssetsSize,
  ThumbnailFormat,
  ThumbnailTypes
} from 'roblox-thumbnails';
import { AnnouncementModel, GroupDetailsPolicies } from '../types';
import { groupAnnouncementsConfig } from '../translation.config';
import { logGroupPageClickEvent } from '../../shared/utils/logging';
import { EventContext as SharedEventContext } from '../../shared/constants/eventConstants';
import announcementsService from '../services/announcementsService';
import Message from '../../shared/components/content/MessageContent';
import ContentReactions from '../../shared/components/reactions/ContentReactions';
import AnnouncementEmbeds from './AnnouncementEmbeds';
import groupAnnouncementsConsts from '../constants/groupAnnouncementsConstants';
import { useAnnouncementTracking } from '../hooks/useAnnouncementTracking';
import PollVoter from '../../customForms/components/PollVoter';
import { useAnnouncementPollsEnabled } from '../hooks/useAnnouncementPollsEnabled';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import useAnnouncementRealtime from '../hooks/useAnnouncementRealtime';
import useAnnouncementViewExposure from '../hooks/useAnnouncementViewExposure';
import AnnouncementHeader from './AnnouncementHeader';

const CONTENT_HEIGHT_LIMIT_PX = 400;

export type AnnouncementDisplayProps = {
  announcement: AnnouncementModel;
  groupId: number;
  policies: GroupDetailsPolicies;
  isMemberOfGroup: boolean;
  onDeleted?: () => void;
  canCreateAnnouncements?: boolean;
  truncateContent?: boolean;
  onRefetchAnnouncement?: () => void;
  onEditAnnouncement?: (announcement: AnnouncementModel) => void;
} & WithTranslationsProps;

type StringWithEscapeHTML = string & { escapeHTML: () => string };

const AnnouncementDisplay = ({
  announcement,
  groupId,
  policies,
  isMemberOfGroup,
  onDeleted,
  canCreateAnnouncements,
  truncateContent = true,
  onRefetchAnnouncement,
  onEditAnnouncement,
  translate
}: AnnouncementDisplayProps): JSX.Element => {
  const { id, messageId, title, content, reactions, imageAssetId, formId } = announcement;

  const isPollsEnabled = useAnnouncementPollsEnabled();
  const { features } = useCommunityProductFeatures();

  useAnnouncementRealtime({
    groupId,
    realtimeEnabled: !!features.RealtimeMessaging,
    refetchAnnouncement: onRefetchAnnouncement ?? (() => undefined)
  });

  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const { systemFeedbackService } = useSystemFeedback();
  const { trackReactionToggled, trackDeleteBannerShown } = useAnnouncementTracking({ groupId });
  const announcementViewRef = useAnnouncementViewExposure(groupId, announcement.id);

  useEffect(() => {
    if (
      truncateContent &&
      contentRef.current &&
      contentRef.current.offsetHeight > CONTENT_HEIGHT_LIMIT_PX
    ) {
      setIsTruncated(true);
    }
  }, [truncateContent]);

  const toggleTruncation = useCallback(() => {
    setIsTruncated(!isTruncated);
  }, [isTruncated]);

  const handleMenuOpened = useCallback(
    (event?: React.MouseEvent) => {
      if (event) {
        event.preventDefault();
      }

      logGroupPageClickEvent({
        groupId,
        clickTargetType: 'announcementOptionsMenu',
        context: SharedEventContext.GroupHomepage
      });
    },
    [groupId]
  );

  const onDelete = useCallback(async () => {
    try {
      await announcementsService.deleteAnnouncement(groupId, announcement.id);
      systemFeedbackService.success(translate('Message.AnnouncementDeleteSuccess'));
      trackDeleteBannerShown({ bannerMessageShown: 'Message.AnnouncementDeleteSuccess' });
      onDeleted?.();
    } catch (error) {
      systemFeedbackService.warning(translate('Message.AnnouncementDeleteFail'));
      trackDeleteBannerShown({ bannerMessageShown: 'Message.AnnouncementDeleteFail' });
    }
  }, [groupId, announcement, onDeleted, systemFeedbackService, translate, trackDeleteBannerShown]);

  const onEdit = useCallback(() => {
    if (onEditAnnouncement) {
      onEditAnnouncement(announcement);
      return;
    }
    history.push(groupAnnouncementsConsts.routes.editAnnouncement, { announcement });
  }, [announcement, history, onEditAnnouncement]);

  // ContentReactions handles the optimistic UI; we just persist the toggle and report success.
  // Returning `false` on failure tells the shared component to roll the optimistic update back.
  const onToggleReaction = useCallback(
    async (emoteId: string, togglingOn: boolean): Promise<boolean> => {
      try {
        if (togglingOn) {
          await announcementsService.addReaction(groupId, id, messageId, emoteId);
        } else {
          await announcementsService.removeReaction(groupId, id, messageId, emoteId);
        }
        logGroupPageClickEvent({
          groupId,
          clickTargetType: togglingOn ? 'shoutReactionAdded' : 'shoutReactionRemoved',
          clickTargetId: id,
          context: SharedEventContext.GroupHomepage
        });
        trackReactionToggled({ announcementId: id, emoteId, isReactionAdded: togglingOn });
        return true;
      } catch {
        systemFeedbackService.warning(translate('NetworkError'));
        return false;
      }
    },
    [groupId, id, messageId, systemFeedbackService, translate, trackReactionToggled]
  );

  // Only signed-in users can react. Anyone else sees the row in view-only mode.
  const reactionsViewOnly = !CurrentUser?.isAuthenticated;

  const canRenderRichText = features.AnnouncementsRichTextRead && !!content.slate;

  // be cautious editing below code. this can easily create a XSS vulnerability if not handled properly.
  const linkifiedContent = useMemo(() => {
    if (canRenderRichText) {
      // Render slate rich text to static HTML, then pass through Linkify to make URLs clickable.
      // We use dangerouslySetInnerHTML for both paths so React doesn't clobber our linkified anchors.
      const richHtml = renderToStaticMarkup(<Message content={content} />);
      return Linkify !== undefined ? Linkify.String(richHtml) : richHtml;
    }
    const plainText = content.plainText || '';
    if (Linkify !== undefined) {
      // we need to cast content to new type because typescript is unaware of the escapeHTML added to the string prototype
      const escapedContent = ((plainText as unknown) as StringWithEscapeHTML).escapeHTML();
      return Linkify.String(escapedContent);
    }
    // unsafe to return any content if Linkify is not defined because we need to use escapeHTML method
    return '';
  }, [content, canRenderRichText]);

  const showThumbnail = !!imageAssetId;

  return (
    <div
      className='announcement-display gap-large'
      data-testid='announcement-display'
      ref={announcementViewRef}>
      <AnnouncementHeader
        announcement={announcement}
        groupId={groupId}
        canCreateAnnouncements={!!canCreateAnnouncements}
        headerClassName='announcement-display-header flex justify-between'
        menuClassName='announcement-display-context-menu margin-left-auto'
        menuButtonTestId='announcement-display-more-actions'
        onDelete={onDelete}
        onEdit={onEdit}
        onMenuButtonClick={handleMenuOpened}
      />
      {showThumbnail && (
        <div className='announcement-display-thumbnail-aspect-ratio-wrapper'>
          <div className='announcement-thumbnail-wrapper'>
            <Thumbnail2d
              containerClass='announcement-thumbnail radius-medium thumbnail-primary'
              targetId={imageAssetId ?? 0}
              size={ThumbnailAssetsSize.width930}
              format={ThumbnailFormat.png}
              type={ThumbnailTypes.assetThumbnail}
            />

            <Thumbnail2d
              containerClass='announcement-thumbnail radius-medium thumbnail-fallback'
              targetId={imageAssetId ?? 0}
              size={ThumbnailAssetsSize.width1440}
              format={ThumbnailFormat.png}
              type={ThumbnailTypes.assetThumbnail}
            />
          </div>
        </div>
      )}
      <div>
        <h2
          className='text-heading-medium padding-none announcement-display-title'
          data-testid='announcement-display-heading'>
          {title}
        </h2>
        <div className='announcement-display-body text-body-medium'>
          <div
            className={classNames(
              'announcement-display-body-content',
              canRenderRichText && 'richtext-base',
              isTruncated && 'truncated'
            )}
            data-testid='announcement-display-body'
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: linkifiedContent }}
          />
          {isTruncated && (
            <button
              className='announcement-display-show-more'
              type='button'
              onClick={toggleTruncation}>
              {translate('Action.ShowMore')}
            </button>
          )}
        </div>
      </div>
      {policies.displayMarketplaceEmbed && (
        <AnnouncementEmbeds
          content={announcement.originalContent.plainText || ''}
          groupId={groupId}
        />
      )}
      {formId && isPollsEnabled && (
        <PollVoter
          groupId={groupId}
          vertical={groupAnnouncementsConsts.customFormsVertical}
          formId={formId}
          announcementId={id}
          formDefinition={announcement.customFormDefinition}
          isMemberOfGroup={isMemberOfGroup}
          translate={translate}
        />
      )}
      <div className='announcement-display-reaction-row'>
        <ContentReactions
          initialReactions={reactions}
          onToggleReaction={onToggleReaction}
          viewOnly={reactionsViewOnly}
        />
      </div>
    </div>
  );
};
export default withTranslations(AnnouncementDisplay, groupAnnouncementsConfig);
