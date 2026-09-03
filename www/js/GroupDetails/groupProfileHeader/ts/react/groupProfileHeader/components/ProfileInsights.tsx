import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-utilities';
import { CurrentUser } from 'Roblox';
import { Skeleton } from '@rbx/ui';
import ProfileInsightPill from './ProfileInsightPill';
import { useGroupProfileHeaderContext } from '../context/GroupProfileHeaderContext';
import MembersListDialog from '../../groupMembersList/components/MembersListDialog';
import { truncateAndAbbreviateNumber, suffixNames } from '../../shared/utils/abbreviateNumbers';
import useMembersFollowersLabel from '../../shared/utils/useMembersFollowersLabel';
import EducationalTooltip from '../../shared/components/EducationalTooltip';
import UserRolesListDialog from '../../shared/components/UserRolesListDialog';
import {
  sendMembersListClickEvent,
  sendRankClickEvent
} from '../../shared/userActivity/groupPageEventStream';

const ABBREVIATION_THRESHOLD = 10000;
const DIGITS_AFTER_DECIMAL = 1;
const SKELETON_HEIGHT = 25;
const SKELETON_WIDTH = 125;
const MEMBERS_LIST_TOOLTIP_DISMISSED_KEY = 'Roblox.Groups.MembersListEducationalTooltipDismissed';

const ProfileInsights: React.FC = () => {
  const { translate } = useTranslation();
  const {
    userRole,
    groupId,
    rolesData,
    communityProfileHeaderData,
    canViewMembers
  } = useGroupProfileHeaderContext();
  const { counts, roleName, hasSocialModules } = communityProfileHeaderData ?? {};
  const membersCount = counts?.membersCount;

  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [isMembersTooltipDismissed, setIsMembersTooltipDismissed] = useState(false);

  const toggleMembersModal = useCallback(() => {
    setMembersModalOpen(prev => !prev);
  }, []);

  const handleMembersClick = useCallback(() => {
    sendMembersListClickEvent();
    toggleMembersModal();
  }, [toggleMembersModal]);

  const toggleRoleModal = useCallback(() => {
    setRoleModalOpen(prev => !prev);
  }, []);

  const handleRoleClick = useCallback(() => {
    sendRankClickEvent();
    toggleRoleModal();
  }, [toggleRoleModal]);

  const truncatedMembersCount = useMemo(() => {
    if (membersCount === undefined) {
      return '';
    }

    return truncateAndAbbreviateNumber(
      membersCount,
      ABBREVIATION_THRESHOLD,
      suffixNames.withPlus,
      DIGITS_AFTER_DECIMAL
    );
  }, [membersCount]);

  const membersFollowersLabel = useMembersFollowersLabel({
    hasSocialModules: Boolean(hasSocialModules),
    count: membersCount ?? 0,
    truncatedCount: truncatedMembersCount,
    capitalize: true
  });

  const membersCountLabel = membersCount === undefined ? '' : membersFollowersLabel;

  const handleTooltipDismiss = useCallback(() => {
    setIsMembersTooltipDismissed(true);
  }, []);

  if (!communityProfileHeaderData) {
    return (
      <Skeleton animate variant='rectangular' height={SKELETON_HEIGHT} width={SKELETON_WIDTH} />
    );
  }

  const onClickMembers = canViewMembers ? handleMembersClick : undefined;

  const onClickRole = userRole?.isBase || !roleName ? undefined : handleRoleClick;

  const showEducationalTooltip = membersCount !== undefined && !isMembersTooltipDismissed;

  // Click logged via onClickMembers, wired only when the pill is interactive.
  const membersCountPill = (
    <ProfileInsightPill onClick={onClickMembers}>{membersCountLabel}</ProfileInsightPill>
  );

  return (
    <React.Fragment>
      <div className='profile-insights-container flex gap-small'>
        {membersCount !== undefined &&
          (showEducationalTooltip && canViewMembers ? (
            <EducationalTooltip
              title={translate('Heading.MembersListEducationalTooltip')}
              description={translate('Label.MembersListEducationalTooltip')}
              localStorageKey={MEMBERS_LIST_TOOLTIP_DISMISSED_KEY}
              onDismiss={handleTooltipDismiss}>
              {membersCountPill}
            </EducationalTooltip>
          ) : (
            membersCountPill
          ))}
        {roleName !== undefined && (
          <ProfileInsightPill title={roleName} onClick={onClickRole}>
            {roleName} {translate('Heading.Rank')}
          </ProfileInsightPill>
        )}
      </div>

      {membersModalOpen && (
        <MembersListDialog
          open={membersModalOpen}
          onClose={toggleMembersModal}
          groupId={groupId}
          userRole={userRole}
          roles={rolesData || []}
          hasSocialModules={hasSocialModules}
        />
      )}

      {roleModalOpen && (
        <UserRolesListDialog
          open={roleModalOpen}
          onClose={toggleRoleModal}
          groupId={groupId}
          userId={Number(CurrentUser.userId)}
        />
      )}
    </React.Fragment>
  );
};

export default ProfileInsights;
