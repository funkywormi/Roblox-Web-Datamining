import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useQuery } from '@tanstack/react-query';
import { useSystemFeedback } from 'react-style-guide';
import { useHistory } from 'react-router-dom';
import { IconButton } from '@rbx/foundation-ui';
import classNames from 'classnames';
import { CurrentUser, Linkify } from 'Roblox';
import { elementVisibilityService } from 'core-roblox-utilities';
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
import usersService from '../../shared/services/usersService';
import { GroupMembershipDetailResponse } from '../../shared/types';
import UserDisplay from '../../shared/components/UserDisplay';
import Message from '../../shared/components/content/MessageContent';
import ContentReactions from '../../shared/components/reactions/ContentReactions';
import AnnouncementEmbeds from './AnnouncementEmbeds';
import AnnouncementMenu from './AnnouncementMenu';
import groupAnnouncementsConsts from '../constants/groupAnnouncementsConstants';
import { useAnnouncementTracking } from '../hooks/useAnnouncementTracking';
import PollVoter from '../../customForms/components/PollVoter';
import { useAnnouncementPollsEnabled } from '../hooks/useAnnouncementPollsEnabled';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import useAnnouncementRealtime from '../hooks/useAnnouncementRealtime';

const CONTENT_HEIGHT_LIMIT_PX = 400;

export type AnnouncementDisplayProps = {
  announcement: AnnouncementModel;
  groupId: number;
  policies: GroupDetailsPolicies;
  isMemberOfGroup: boolean;
  onDeleted?: () => void;
  canCreateAnnouncements?: boolean;
  onRefetchAnnouncement?: () => void;
} & WithTranslationsProps;

type StringWithEscapeHTML = string & { escapeHTML: () => string };

const AnnouncementDisplay = ({
  announcement,
  groupId,
  policies,
  isMemberOfGroup,
  onDeleted,
  canCreateAnnouncements,
  onRefetchAnnouncement,
  translate
}: AnnouncementDisplayProps): JSX.Element => {
  const {
    id,
    messageId,
    title,
    content,
    reactions,
    imageAssetId,
    formId,
    createdBy,
    createdAt
  } = announcement;

  const isPollsEnabled = useAnnouncementPollsEnabled();
  const { features } = useCommunityProductFeatures();

  useAnnouncementRealtime({
    groupId,
    realtimeEnabled: !!features.RealtimeMessaging,
    refetchAnnouncement: onRefetchAnnouncement ?? (() => undefined)
  });

  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const announcementViewRef = useRef<HTMLDivElement>(null);
  const hasLoggedExposure = useRef(false);
  const history = useHistory();
  const { systemFeedbackService } = useSystemFeedback();
  const {
    trackReactionToggled,
    trackDeleteBannerShown,
    trackAnnouncementViewed
  } = useAnnouncementTracking({ groupId });

  useEffect(() => {
    if (contentRef.current && contentRef.current.offsetHeight > CONTENT_HEIGHT_LIMIT_PX) {
      setIsTruncated(true);
    }
  }, []);

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

  const { data: announcementAuthor } = useQuery({
    queryKey: ['announcement-user-display', groupId, createdBy],
    queryFn: async () => {
      try {
        const [userRecords, membershipDetailResponse] = await Promise.all([
          usersService.fetchUserInfo(createdBy),
          usersService.getUserGroupRoles(createdBy)
        ]);

        const user = userRecords[0];
        if (!user) {
          return null;
        }

        let groupRoleName: string | undefined;
        const groupMembership = membershipDetailResponse.find(
          (membership: GroupMembershipDetailResponse) => membership.group.id === groupId
        );

        if (groupMembership?.role) {
          groupRoleName = groupMembership.role.name;
        }

        return { user, groupRoleName };
      } catch {
        // Fall through to FormerMember label (same as forums when role is unknown).
        return null;
      }
    },
    enabled: !!groupId && !!createdBy
  });

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
    history.push(groupAnnouncementsConsts.routes.editAnnouncement, { announcement });
  }, [announcement, history]);

  const reportUrl = useMemo(
    () =>
      groupAnnouncementsConsts.urls.reportAbuseRevamp({
        targetId: announcement.id,
        submitterId: CurrentUser.userId,
        abuseVector: 'group_announcement',
        custom: {
          stringId: groupId.toString()
        }
      }),
    [groupId, announcement.id]
  );

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

  const canEditAnnouncement = useMemo(() => {
    return canCreateAnnouncements && Number(CurrentUser.userId) === createdBy;
  }, [canCreateAnnouncements, createdBy]);

  const showThumbnail = !!imageAssetId;

  useEffect(() => {
    const element = announcementViewRef.current;
    if (!element) return undefined;

    return elementVisibilityService.observeVisibility({ element, threshold: 0.75 }, visible => {
      if (visible && !hasLoggedExposure.current) {
        hasLoggedExposure.current = true;
        trackAnnouncementViewed({ announcementId: announcement.id });
      }
    });
  }, [groupId, announcement.id, trackAnnouncementViewed]);

  return (
    <div
      className='announcement-display gap-large'
      data-testid='announcement-display'
      ref={announcementViewRef}>
      <div className='announcement-display-header flex justify-between'>
        {announcementAuthor && (
          <UserDisplay
            userId={announcementAuthor.user.id}
            groupId={groupId}
            createdTime={createdAt}
            userDisplayName={announcementAuthor.user.displayName}
            hasVerifiedBadge={announcementAuthor.user.hasVerifiedBadge}
            groupRoleName={announcementAuthor.groupRoleName ?? translate('Label.FormerMember')}
          />
        )}
        <div className='announcement-display-context-menu margin-left-auto'>
          <AnnouncementMenu
            announcementId={announcement.id}
            groupId={groupId}
            onDelete={onDelete}
            onEdit={onEdit}
            reportUrl={reportUrl}
            canCreateAnnouncements={canCreateAnnouncements}
            canEditAnnouncement={canEditAnnouncement}
            button={
              <IconButton
                as='button'
                icon='icon-filled-three-dots-horizontal'
                variant='Utility'
                size='Medium'
                ariaLabel={translate('Action.More')}
                data-testid='announcement-display-more-actions'
                onClick={handleMenuOpened}
              />
            }
          />
        </div>
      </div>
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
