import React from 'react';
import { withTranslations } from 'react-utilities';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { groupsConfig } from '../translation.config';
import { Group, GroupPermissions } from '../../shared/types';
import KeywordBlockListSection from './KeywordBlockListSection';
import ActivitySettingsSection from './ActivitySettingsSection';

export type GroupContentModerationSectionProps = {
  group: Group;
  permissions: GroupPermissions;
};

const GroupContentModerationSection = ({
  group,
  permissions
}: GroupContentModerationSectionProps): JSX.Element | null => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className='section-content remove-panel group-content-moderation-section'>
        {!!group.id && <ActivitySettingsSection groupId={group.id} permissions={permissions} />}
      </div>
      <div className='section-content remove-panel group-content-moderation-section'>
        {!!group.id && <KeywordBlockListSection groupId={group.id} permissions={permissions} />}
      </div>
    </QueryClientProvider>
  );
};

export default withTranslations(GroupContentModerationSection, groupsConfig);
