import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-utilities';
import { BadgeSizes, VerifiedBadgeIconContainer } from 'roblox-badges';
import { Thumbnail2d, ThumbnailTypes, ThumbnailGameIconSize } from 'roblox-thumbnails';
import { GroupsListGroup } from '../types';
import GroupListItemPill from './GroupListItemPill';
import { truncateAndAbbreviateNumber, suffixNames } from '../../shared/utils/abbreviateNumbers';
import useMembersFollowersLabel from '../../shared/utils/useMembersFollowersLabel';
import EntrypointExposure from '../../shared/components/EntrypointExposure';
import { useEntrypointImpressionId } from '../../shared/utils/entrypointMetrics';
import {
  logCmntyEntrypointClickEvent,
  logCmntyEntrypointExposureEvent
} from '../../shared/utils/logging';
import { EntryPoint, EventContext } from '../../shared/constants/eventConstants';

const SEPARATOR_CHARACTER = '•';
const ABBREVIATION_THRESHOLD = 1000;
const DIGITS_AFTER_DECIMAL = 1;

const GroupListItem = ({
  group,
  isActive,
  showRank,
  showMemberCount,
  isSidebar
}: {
  group: GroupsListGroup;
  isActive?: boolean;
  showRank?: boolean;
  showMemberCount?: boolean;
  isSidebar?: boolean;
}): JSX.Element => {
  const { translate } = useTranslation();

  const {
    name: groupName,
    members: membersCount,
    role,
    isOwner,
    groupHasVerifiedBadge,
    groupUrl,
    hasSocialModules
  } = group;

  // Shared per-tile id: the on-visible exposure and the follow-up click both carry it (GRPS-3058/3059).
  const entrypointImpressionId = useEntrypointImpressionId();

  const logExposure = useCallback(() => {
    logCmntyEntrypointExposureEvent({
      context: EventContext.CommunitiesPage,
      entryPoint: EntryPoint.CommunitiesPage,
      entrypointImpressionId,
      groupId: group.id,
      pageRoute: window.location.pathname
    });
  }, [entrypointImpressionId, group.id]);

  const logClick = useCallback(() => {
    logCmntyEntrypointClickEvent({
      context: EventContext.CommunitiesPage,
      entryPoint: EntryPoint.CommunitiesPage,
      entrypointImpressionId,
      groupId: group.id,
      groupSize: membersCount,
      pageRoute: window.location.pathname
    });
  }, [entrypointImpressionId, group.id, membersCount]);

  const showOwnerMeta = isOwner && !showRank;
  const hasMetaInfo = showMemberCount || showOwnerMeta;

  const truncatedMembersCount = useMemo(() => {
    if (membersCount === undefined) {
      return '';
    }

    return truncateAndAbbreviateNumber(
      membersCount,
      ABBREVIATION_THRESHOLD,
      suffixNames.withoutPlus,
      DIGITS_AFTER_DECIMAL
    );
  }, [membersCount]);

  const membersFollowersLabel = useMembersFollowersLabel({
    hasSocialModules: Boolean(hasSocialModules),
    count: membersCount ?? 0,
    truncatedCount: truncatedMembersCount,
    capitalize: false
  });

  const membersCountLabel =
    !showMemberCount || membersCount === undefined ? '' : membersFollowersLabel;

  const groupListItem = (
    <a
      href={groupUrl}
      className={classNames('groups-list-item', isActive && 'active')}
      onClick={isSidebar ? undefined : logClick}>
      <div className='groups-list-item-thumbnail'>
        <Thumbnail2d
          type={ThumbnailTypes.groupIcon}
          targetId={group.id}
          size={ThumbnailGameIconSize.size150}
          containerClass='size-full'
        />
      </div>
      <div className='group-list-item-info grow-1 min-width-0'>
        <div className='flex items-baseline'>
          <div className='text-no-wrap text-truncate-end'>
            <span className='text-title-medium'>{groupName}</span>
          </div>
          {groupHasVerifiedBadge && (
            <VerifiedBadgeIconContainer
              overrideContainerClass='padding-left-small inline shrink-0'
              size={BadgeSizes.SUBHEADER}
            />
          )}
        </div>
        {hasMetaInfo && (
          <div className='text-no-wrap text-body-medium text-truncate-end content-muted'>
            {showMemberCount && <span className='text-body-medium'>{membersCountLabel}</span>}
            {showMemberCount && showOwnerMeta && (
              <React.Fragment>&nbsp;{SEPARATOR_CHARACTER}&nbsp;</React.Fragment>
            )}
            {showOwnerMeta && (
              <span className='text-body-medium' data-testid='groups-list-item-owned-marker'>
                {translate('Label.Owned')}
              </span>
            )}
          </div>
        )}
      </div>
      {showRank &&
        (isOwner ? (
          <GroupListItemPill label={translate('Label.Owned')} flavor='contrast' noTruncate />
        ) : (
          <GroupListItemPill label={role.name} flavor='neutral' />
        ))}
    </a>
  );

  if (isSidebar) {
    return groupListItem;
  }

  return <EntrypointExposure onExposure={logExposure}>{groupListItem}</EntrypointExposure>;
};

export default GroupListItem;
