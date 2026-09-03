import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { Group } from '../../shared/types';
import { useJoinRequestsCount } from '../hooks/useJoinRequestsQuery';
import MembersTab from './MembersTab';
import BannedTab from './BannedTab';
import RequestsTab from './RequestsTab';

const FIVE_MINUTE_STALE_TIME_MS = 5 * 60 * 1000;

type ConfigureGroupMembersContainerProps = {
  group: Group;
  policies: Record<string, boolean>;
};

const ConfigureGroupMembersContainer: React.FC<ConfigureGroupMembersContainerProps> = ({
  group,
  policies
}) => {
  const { translate } = useTranslation();
  const { SystemFeedbackComponent } = useSystemFeedback();

  const showBannedUsersTab =
    (group.permissions?.groupMembershipPermissions.banMembers && policies.displayGroupBans) ??
    false;

  const showRequestsTab = Boolean(
    group.permissions?.groupMembershipPermissions.inviteMembers && !group.publicEntryAllowed
  );

  const { showPill: showRequestsCount, displayText: requestsCountText } = useJoinRequestsCount({
    groupId: group.id,
    enabled: showRequestsTab,
    staleTime: FIVE_MINUTE_STALE_TIME_MS
  });

  if (!showBannedUsersTab && !showRequestsTab) {
    return (
      <div className='configure-group-members-container width-full'>
        <MembersTab group={group} />
      </div>
    );
  }

  return (
    <div className='configure-group-members-container width-full'>
      <Tabs size='Medium' variant='Contained' defaultValue='members'>
        <TabsList>
          <TabsTrigger value='members'>{translate('Heading.Members')}</TabsTrigger>
          {showBannedUsersTab && (
            <TabsTrigger value='banned'>{translate('Heading.Banned')}</TabsTrigger>
          )}
          {showRequestsTab && (
            <TabsTrigger value='requests'>
              {translate('Heading.Requests')}
              {showRequestsCount ? ` (${requestsCountText})` : ''}
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value='members'>
          <MembersTab group={group} />
        </TabsContent>
        <TabsContent value='banned'>
          <BannedTab group={group} />
        </TabsContent>
        <TabsContent value='requests'>
          <RequestsTab group={group} />
        </TabsContent>
      </Tabs>
      <SystemFeedbackComponent />
    </div>
  );
};

export default ConfigureGroupMembersContainer;
