import React from 'react';
import { CurrentUser } from 'Roblox';
import classNames from 'classnames';
import { Badge, Icon } from '@rbx/foundation-ui';
import { Thumbnail2d, ThumbnailAssetsSize, ThumbnailTypes } from 'roblox-thumbnails';
import { useTranslation } from 'react-utilities';
import { AnnouncementModel } from '../types';
import ContentReactions from '../../shared/components/reactions/ContentReactions';
import { useAnnouncementPollsEnabled } from '../hooks/useAnnouncementPollsEnabled';
import Message from '../../shared/components/content/MessageContent';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import useAnnouncementViewExposure from '../hooks/useAnnouncementViewExposure';
import AnnouncementHeader from './AnnouncementHeader';
import { USER_DISPLAY_AVATAR_USERNAME_LINK_CLASS } from '../../shared/components/UserDisplay';
import ContentPreviewCard from '../../shared/components/ContentPreviewCard';
import announcementRoutes from '../constants/announcementRoutes';
import { ANNOUNCEMENT_MENU_CLASS } from './AnnouncementMenu';

type AnnouncementArchiveCardProps = {
  announcement: AnnouncementModel;
  groupId: number;
  canCreateAnnouncements: boolean;
  onDelete: (announcement: AnnouncementModel) => Promise<void>;
  onEdit: (announcement: AnnouncementModel) => void;
  onModifiedOpen: (announcementId: string) => void;
  onOpen: (announcementId: string) => void;
  onToggleReaction: (
    announcement: AnnouncementModel,
    emoteId: string,
    togglingOn: boolean
  ) => Promise<boolean>;
};

const ANNOUNCEMENT_NAV_BLOCK_SELECTOR = [
  '.group-posts-preview-menu',
  `.${ANNOUNCEMENT_MENU_CLASS}`,
  `.${USER_DISPLAY_AVATAR_USERNAME_LINK_CLASS}`,
  '.groups-content-reactions',
  '.reaction-picker'
].join(', ');

const AnnouncementArchiveCard = ({
  announcement,
  groupId,
  canCreateAnnouncements,
  onDelete,
  onEdit,
  onModifiedOpen,
  onOpen,
  onToggleReaction
}: AnnouncementArchiveCardProps): JSX.Element => {
  const isPollsEnabled = useAnnouncementPollsEnabled();
  const { translate } = useTranslation();
  const { features } = useCommunityProductFeatures();
  const { customFormDefinition, customFormResults, hasVoted } = announcement;
  const responseCount = customFormResults?.totalResponses;
  const customFormResponseLabel =
    responseCount === undefined
      ? undefined
      : `${responseCount.toLocaleString()} ${translate(
          responseCount === 1 ? 'Label.ResponseCountSingular' : 'Label.ResponseCountPlural'
        )}`;
  const canRenderRichText = features.AnnouncementsRichTextRead && !!announcement.content.slate;
  const cardRef = useAnnouncementViewExposure<HTMLAnchorElement>(groupId, announcement.id);

  return (
    <ContentPreviewCard
      ref={cardRef}
      href={announcementRoutes.getAnnouncementUrl(groupId, announcement.id)}
      blockedSelector={ANNOUNCEMENT_NAV_BLOCK_SELECTOR}
      onNavigate={() => onOpen(announcement.id)}
      onModifiedClick={() => onModifiedOpen(announcement.id)}
      className='group-announcement-archive-card group-posts-preview'>
      <AnnouncementHeader
        announcement={announcement}
        groupId={groupId}
        canCreateAnnouncements={canCreateAnnouncements}
        headerClassName='group-posts-preview-header'
        menuClassName='group-posts-preview-menu'
        menuButtonTestId='announcement-archive-more-actions'
        onDelete={() => onDelete(announcement)}
        onEdit={() => onEdit(announcement)}
      />
      <div className='group-announcement-archive-card-content'>
        {announcement.imageAssetId && (
          <Thumbnail2d
            containerClass='group-announcement-archive-thumbnail'
            targetId={announcement.imageAssetId}
            size={ThumbnailAssetsSize.width930}
            type={ThumbnailTypes.assetThumbnail}
          />
        )}
        <div className='group-announcement-archive-copy'>
          <div className='group-posts-preview-title-container'>
            <h2 className='group-posts-preview-title text-emphasis text-overflow'>
              {announcement.title}
            </h2>
          </div>
          <div
            className={classNames(
              'group-announcement-archive-body',
              canRenderRichText && 'richtext-base'
            )}>
            {canRenderRichText ? (
              <Message content={announcement.content} />
            ) : (
              announcement.content.plainText
            )}
          </div>
          {isPollsEnabled && customFormDefinition && (
            <div className='group-announcement-archive-poll text-default'>
              <span className='group-announcement-archive-poll-question'>
                <span className='group-announcement-archive-poll-label'>
                  <Icon name='icon-regular-chart-three-horizontal-bars' size='XSmall' />
                  {translate('Heading.Poll')}
                </span>
                <span className='group-announcement-archive-poll-title text-overflow'>
                  {customFormDefinition.title}
                </span>
              </span>
              {(hasVoted || responseCount !== undefined) && (
                <span className='group-announcement-archive-poll-metadata'>
                  {hasVoted && <Badge variant='Neutral' label={translate('Label.Voted')} />}
                  {responseCount !== undefined && (
                    <span className='group-announcement-archive-poll-votes'>
                      {customFormResponseLabel}
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <ContentReactions
        initialReactions={announcement.reactions}
        onToggleReaction={(emoteId, togglingOn) =>
          onToggleReaction(announcement, emoteId, togglingOn)
        }
        viewOnly={!CurrentUser?.isAuthenticated}
      />
    </ContentPreviewCard>
  );
};

export default AnnouncementArchiveCard;
