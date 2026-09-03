import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Button } from '@rbx/foundation-ui';
import { Loading, Tooltip, useSystemFeedback } from 'react-style-guide';
import { useHistory } from 'react-router-dom';
import { AnnouncementModel, CommunityInfo, GroupDetailsPolicies } from '../types';
import { Group, GroupMetadata, GroupMembership } from '../../shared/types';
import communityLinksService from '../services/communityLinksService';
import announcementsService from '../services/announcementsService';
import {
  getHasUserDismissedNotificationsUpsell,
  setUserHasDismissedNotificationsUpsell
} from '../utils/localStorage';
import { groupAnnouncementsConfig } from '../translation.config';
import AnnouncementDisplay from '../components/AnnouncementDisplay';
import { logGroupPageClickEvent } from '../../shared/utils/logging';
import { EventContext } from '../constants/eventConstants';
import { EventContext as SharedEventContext } from '../../shared/constants/eventConstants';
import NotificationsUpsellBanner from '../components/NotificationsUpsellBanner';
import groupsService from '../services/groupsService';
import groupAnnouncementsConstants from '../constants/groupAnnouncementsConstants';
import queryKeys from '../utils/queryKeys';
import { useGroupMembershipChangedListener } from '../../shared/hooks/useGroupMembershipChangedListener';

export type GroupAnnouncementsDisplayProps = {
  group: Group;
  joinGroup: () => Promise<boolean>;
  allowedToJoinGroup: boolean;
  policies: GroupDetailsPolicies;
  metadata: GroupMetadata;
  canCreateAnnouncements: boolean;
  onAnnouncementLoaded?: () => void;
  announcementsData?: { id: string } | null;
  onAnnouncementDeleted?: () => void | Promise<void>;
} & WithTranslationsProps;

const GroupAnnouncementsDisplay = ({
  group,
  joinGroup,
  allowedToJoinGroup,
  policies,
  metadata,
  canCreateAnnouncements,
  onAnnouncementLoaded,
  announcementsData,
  onAnnouncementDeleted,
  translate
}: GroupAnnouncementsDisplayProps): JSX.Element | null => {
  const { SystemFeedbackComponent, systemFeedbackService } = useSystemFeedback();
  const history = useHistory();

  const [isNotificationsUpsellDismissed, setIsNotificationsUpsellDismissed] = useState(
    getHasUserDismissedNotificationsUpsell(group.id)
  );

  const userDismissedNotificationsUpsell = useCallback(() => {
    setIsNotificationsUpsellDismissed(true);
    setUserHasDismissedNotificationsUpsell(group.id);
    logGroupPageClickEvent({
      groupId: group.id,
      clickTargetType: 'dismissNotificationUpsellBanner',
      context: SharedEventContext.GroupHomepage
    });
  }, [group.id]);

  const { isLoading: isLoadingCommunity, data: communityInfo } = useQuery<CommunityInfo | null>({
    queryKey: queryKeys.getCommunityInfoKey(group.id),
    queryFn: async () => {
      const communityInfoResponse: CommunityInfo = await communityLinksService.getLinkedCommunity(
        group.id
      );
      return communityInfoResponse;
    }
  });

  const {
    isLoading: isLoadingAnnouncement,
    data: announcement,
    refetch: fetchLatestAnnouncement
  } = useQuery<AnnouncementModel | null>({
    queryKey: [
      ...queryKeys.getGroupLatestAnnouncementKey(group.id),
      // Scope the cache entry to the current announcement id. When the composer publishes a
      // new announcement, the section container updates `announcementsData.id`; the
      // queryKey change here is what makes react-query issue a fresh fetch for it rather
      // than surfacing the previous announcement's cached value.
      announcementsData?.id ?? null
    ],
    queryFn: async () => {
      if (!announcementsData?.id) {
        return null;
      }

      return announcementsService.getAnnouncementById(group.id, announcementsData.id);
    }
  });

  useEffect(() => {
    if (announcement) {
      onAnnouncementLoaded?.();
    }
  }, [announcement, onAnnouncementLoaded]);

  const { data: groupMembership } = useQuery<GroupMembership | null>({
    queryKey: queryKeys.getGroupMembershipKey(group.id),
    queryFn: async () => {
      const membership = await groupsService.getGroupMembership(group.id);
      return membership;
    }
  });

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(
    groupMembership?.isNotificationsEnabled ?? false
  );
  const [isMemberOfGroup, setIsMemberOfGroup] = useState(
    (groupMembership?.userRole?.role.rank ?? 0) !== 0
  );

  useEffect(() => {
    if (groupMembership) {
      setIsNotificationsEnabled(groupMembership.isNotificationsEnabled ?? false);
      setIsMemberOfGroup((groupMembership.userRole?.role.rank ?? 0) !== 0);
    }
  }, [groupMembership]);

  useGroupMembershipChangedListener(group.id);

  const toggleNotifications = useCallback(
    async (eventContext: string) => {
      const newNotificationsValue = !isNotificationsEnabled;
      try {
        logGroupPageClickEvent({
          groupId: group.id,
          clickTargetType: `toggleNotifications${newNotificationsValue ? 'On' : 'Off'}`,
          context: eventContext
        });

        setUserHasDismissedNotificationsUpsell(group.id);
        setIsNotificationsUpsellDismissed(true);
        setIsNotificationsEnabled(newNotificationsValue);

        // When a non-member toggles on notifications for a group with public entry allowed have them auto-join the group.
        if (
          newNotificationsValue &&
          !isMemberOfGroup &&
          allowedToJoinGroup &&
          group.publicEntryAllowed
        ) {
          try {
            await joinGroup();
            setIsMemberOfGroup(true);
          } catch (error) {
            // If group join failed then reset the UI state. joinGroup will show handle showing a toast to the user with the error.
            setIsNotificationsEnabled(!newNotificationsValue);
            return;
          }
        }
        await groupsService.updateGroupNotificationPreference(group.id, newNotificationsValue);
      } catch (error) {
        // On error reset UI state and show a toast that subscribing to notifications failed
        setIsNotificationsEnabled(!newNotificationsValue);
        systemFeedbackService.warning(translate('Message.SubscribeToNotificationsError'));
      }
    },
    [
      group.id,
      isNotificationsEnabled,
      isMemberOfGroup,
      group.publicEntryAllowed,
      joinGroup,
      allowedToJoinGroup,
      translate,
      systemFeedbackService
    ]
  );

  const handleNotificationBellClicked = useCallback(async () => {
    await toggleNotifications(EventContext.NotificationBell);
  }, [toggleNotifications]);

  const handleNotificationUpsellClicked = useCallback(async () => {
    await toggleNotifications(EventContext.NotificationUpsell);
  }, [toggleNotifications]);

  const handleCreateAnnouncement = useCallback(() => {
    if (!canCreateAnnouncements) {
      return;
    }

    history.push(groupAnnouncementsConstants.routes.createAnnouncement);
  }, [canCreateAnnouncements, history]);

  const showNotificationsUpsell = useMemo(() => {
    if (!groupMembership) {
      return false;
    }

    return (
      // Allow non-members of public entry groups to opt-in to notifications and auto-join the group
      (isMemberOfGroup || (group.publicEntryAllowed && allowedToJoinGroup)) &&
      !isNotificationsUpsellDismissed &&
      !isNotificationsEnabled &&
      metadata.canEnableGroupNotifications
    );
  }, [
    groupMembership,
    isMemberOfGroup,
    group.publicEntryAllowed,
    allowedToJoinGroup,
    isNotificationsUpsellDismissed,
    isNotificationsEnabled,
    metadata.canEnableGroupNotifications
  ]);

  if (isLoadingCommunity || isLoadingAnnouncement) {
    return <Loading />;
  }

  // if we have community info we'll render the announcement display to show guilded announcements
  // even if there are no announcements.
  // Otherwise, if there are no announcements and announcement publishing is disabled, we don't render anything
  if (!communityInfo && !policies.displayGroupAnnouncementPublishing) {
    return null;
  }

  return (
    <div className='group-announcements-display'>
      <div className='container-header flex items-center justify-between'>
        <h2 className='grow-1'>{translate('Heading.Announcements')}</h2>
        {!!announcement && metadata.canEnableGroupNotifications && !canCreateAnnouncements && (
          <Tooltip
            id='group-notifications-tooltip'
            placement='left'
            content={translate(
              isNotificationsEnabled ? 'Action.TurnNotificationsOff' : 'Action.TurnNotificationsOn'
            )}>
            <button
              type='button'
              className='group-announcements-notifications-icon'
              onClick={handleNotificationBellClicked}>
              <span
                className={`icon-notifications-bell${isNotificationsEnabled ? ' followed' : ''}`}
                aria-label='notify'
              />
            </button>
          </Tooltip>
        )}
        {canCreateAnnouncements && (
          <Button
            type='button'
            variant='Standard'
            size='Small'
            data-testid='announcement-display-create'
            onClick={handleCreateAnnouncement}>
            {translate('Action.Create')}
          </Button>
        )}
      </div>
      {!!announcement && (
        <div className='group-section-content'>
          {showNotificationsUpsell && (
            <NotificationsUpsellBanner
              group={group}
              onNotifyClicked={handleNotificationUpsellClicked}
              onDismiss={userDismissedNotificationsUpsell}
              eventContext={SharedEventContext.GroupHomepage}
            />
          )}
          <AnnouncementDisplay
            groupId={group.id}
            announcement={announcement}
            policies={policies}
            isMemberOfGroup={isMemberOfGroup}
            canCreateAnnouncements={canCreateAnnouncements}
            onDeleted={onAnnouncementDeleted}
            // eslint-disable-next-line no-void
            onRefetchAnnouncement={() => void fetchLatestAnnouncement()}
          />
        </div>
      )}
      {!isLoadingAnnouncement && !announcement && (
        <div className='group-section-content-transparent text-center group-announcements-empty-state'>
          {translate('Label.NoAnnouncements')}
        </div>
      )}

      <SystemFeedbackComponent />
    </div>
  );
};

export default withTranslations(GroupAnnouncementsDisplay, groupAnnouncementsConfig);
