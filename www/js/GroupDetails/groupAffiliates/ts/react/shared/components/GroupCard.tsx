import React, { useMemo } from 'react';
import { Thumbnail2d, ThumbnailTypes, ThumbnailGameIconSize } from 'roblox-thumbnails';
import { VerifiedBadgeIconContainer, BadgeSizes } from 'roblox-badges';
import { seoName } from 'core-utilities';
import { Group } from '../types';
import groupConstants from '../constants/groupConstants';
import { truncateAndAbbreviateNumber, suffixNames } from '../utils/abbreviateNumbers';
import useMembersFollowersLabel from '../utils/useMembersFollowersLabel';

const { formatSeoName } = seoName;

const ABBREVIATION_THRESHOLD = 10000;
const DIGITS_AFTER_DECIMAL = 1;

export interface GroupCardGroup {
  id: number;
  name: string;
  memberCount: number;
  hasVerifiedBadge: boolean;
}

interface GroupCardProps {
  group: Group;
  handleClick?: (group: Group) => void;
}

const GroupCard = ({ group, handleClick }: GroupCardProps): JSX.Element => {
  const url = groupConstants.urls.getGroupUrl(group.id, formatSeoName(group.name));

  const truncatedMembersCount = useMemo(() => {
    return truncateAndAbbreviateNumber(
      group.memberCount ?? 0,
      ABBREVIATION_THRESHOLD,
      suffixNames.withPlus,
      DIGITS_AFTER_DECIMAL
    );
  }, [group.memberCount]);

  const membersCountLabel = useMembersFollowersLabel({
    hasSocialModules: true,
    count: group.memberCount ?? 0,
    truncatedCount: truncatedMembersCount,
    capitalize: true
  });

  const onCardClick = () => {
    handleClick?.(group);
  };

  return (
    <div className='game-card'>
      <a href={url} target='_self' onClick={onCardClick} className='card-item game-card-container'>
        <span className='game-card-thumb-container'>
          <Thumbnail2d
            type={ThumbnailTypes.groupIcon}
            targetId={group.id}
            size={ThumbnailGameIconSize.size150}
          />
        </span>
        <div className='game-card-container group-card-name-container'>
          <div
            className='game-card-name game-card-name-with-verified-badge text-overflow'
            title={group.name}>
            {group.name}
          </div>
          {group.hasVerifiedBadge && (
            <VerifiedBadgeIconContainer
              overrideImgClass='verified-badge-icon-group-discover-rendered'
              size={BadgeSizes.TITLE}
            />
          )}
        </div>
        <div className='text-overflow game-card-name-secondary'>{membersCountLabel}</div>
      </a>
    </div>
  );
};

export default GroupCard;
