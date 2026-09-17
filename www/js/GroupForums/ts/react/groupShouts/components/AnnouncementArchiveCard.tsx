import React from 'react';
import { CurrentUser } from 'Roblox';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Thumbnail2d, ThumbnailAssetsSize, ThumbnailTypes } from 'roblox-thumbnails';
import { AnnouncementModel } from '../types';
import ContentReactions from '../../shared/components/reactions/ContentReactions';
import { useAnnouncementPollsEnabled } from '../hooks/useAnnouncementPollsEnabled';
import Message from '../../shared/components/content/MessageContent';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import useAnnouncementViewExposure from '../hooks/useAnnouncementViewExposure';
import AnnouncementHeader from './AnnouncementHeader';
import announcementRoutes from '../constants/announcementRoutes';

type AnnouncementArchiveCardProps = {
  announcement: AnnouncementModel;
  groupId: number;
  canCreateAnnouncements: boolean;
  onDelete: (announcement: AnnouncementModel) => Promise<void>;
  onEdit: (announcement: AnnouncementModel) => void;
  onOpen: (announcementId: string) => void;
  onToggleReaction: (
    announcement: AnnouncementModel,
    emoteId: string,
    togglingOn: boolean
  ) => Promise<boolean>;
};

const AnnouncementArchiveCard = ({
  announcement,
  groupId,
  canCreateAnnouncements,
  onDelete,
  onEdit,
  onOpen,
  onToggleReaction
}: AnnouncementArchiveCardProps): JSX.Element => {
  const isPollsEnabled = useAnnouncementPollsEnabled();
  const { features } = useCommunityProductFeatures();
  const poll = announcement.customFormDefinition;
  const canRenderRichText = features.AnnouncementsRichTextRead && !!announcement.content.slate;
  const cardRef = useAnnouncementViewExposure(groupId, announcement.id);

  return (
    <div ref={cardRef} className='group-announcement-archive-card group-posts-preview'>
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
              <Link
                to={announcementRoutes.getAnnouncementRoute(announcement.id)}
                className='group-announcement-archive-title-link'
                onClick={() => onOpen(announcement.id)}>
                {announcement.title}
              </Link>
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
        </div>
      </div>
      {isPollsEnabled && poll && (
        <div className='group-posts-preview-meta-data text-default'>
          <div className='group-posts-preview-meta-data-replies'>
            <span>{poll.title}</span>
          </div>
        </div>
      )}
      <ContentReactions
        initialReactions={announcement.reactions}
        onToggleReaction={(emoteId, togglingOn) =>
          onToggleReaction(announcement, emoteId, togglingOn)
        }
        viewOnly={!CurrentUser?.isAuthenticated}
      />
    </div>
  );
};

export default AnnouncementArchiveCard;
