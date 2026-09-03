import Roblox, { CurrentUser, EnvironmentUrls } from 'Roblox';
import {
  GroupManagementRootProviders,
  GroupManagementSurface,
  UnificationOptInModal
} from '@rbx/group-management';
import { NativeName, Locale } from '@rbx/intl';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, useTheme } from 'react-utilities';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { SystemFeedbackProvider, useSystemFeedback } from 'react-style-guide';
import GroupUserCard, { GroupUserCardProps } from './containers/GroupUserCard';
import Banner, { BannerProps } from '../shared/components/Banner';
import '../../../css/tailwind.css';
import RobloxIntlTranslationProvider from '../configureGroupRoles/providers/RobloxIntlTranslationProvider';
import {
  CommunityProductFeaturesContextProvider,
  useCommunityProductFeatures
} from '../shared/contexts/CommunityProductFeaturesContext';

const UNIFICATION_OPT_IN_MODAL_ROOT_ID = 'unification-opt-in-modal-root';
const { domain, websiteUrl } = EnvironmentUrls as { domain: string; websiteUrl: string };
const translationResourceProvider = new RobloxIntlTranslationProvider({
  locale: Locale.English,
  nativeName: NativeName.English
});
const navigation = {
  currentRoleId: null,
  navigateToRole: null,
  getUserProfileUrl: (userId: number) => `/users/${userId}/profile`
};

const UnificationOptInModalRoot = ({ groupId }: { groupId: number }): JSX.Element | null => {
  const theme = useTheme();
  const { features, isLoading } = useCommunityProductFeatures();
  const { SystemFeedbackComponent, systemFeedbackService } = useSystemFeedback();
  const currentUserId = Number(CurrentUser.userId);

  if (isLoading || features.IsUnifiedUIEnabled !== true) {
    return null;
  }

  return (
    <React.Fragment>
      <GroupManagementRootProviders
        surface={GroupManagementSurface.Community}
        group={{ id: groupId }}
        user={{ id: currentUserId }}
        theme={theme}
        navigation={navigation}
        translationProvider={translationResourceProvider}
        queryClient={queryClient}
        showToast={message => systemFeedbackService.success(message)}>
        <UnificationOptInModal
          groupId={groupId}
          userId={currentUserId}
          getCreatorHubRoleUrl={(roleId: string) =>
            `https://create.${domain}/dashboard/group/roles/${roleId}?groupId=${groupId}&activeTab=GroupRolesTab`
          }
          getLegacyRolesUrl={(groupIdString: string) =>
            `${websiteUrl}/communities/configure?id=${groupIdString}#!/roles`
          }
          showToast={message => systemFeedbackService.success(message)}
        />
      </GroupManagementRootProviders>
      <SystemFeedbackComponent />
    </React.Fragment>
  );
};

const initializeUnificationOptInModal = (groupId: number) => {
  if (!Number.isSafeInteger(groupId) || groupId <= 0) {
    return;
  }

  let container = document.getElementById(UNIFICATION_OPT_IN_MODAL_ROOT_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = UNIFICATION_OPT_IN_MODAL_ROOT_ID;
    document.body.appendChild(container);
  }

  unmountComponentAtNode(container);

  render(
    <SystemFeedbackProvider>
      <QueryClientProvider client={queryClient}>
        <CommunityProductFeaturesContextProvider groupId={groupId}>
          <UnificationOptInModalRoot groupId={groupId} />
        </CommunityProductFeaturesContextProvider>
      </QueryClientProvider>
    </SystemFeedbackProvider>,
    container
  );
};

const renderGroupUserCard = (container: Element, props: GroupUserCardProps) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components
  render(
    <SystemFeedbackProvider>
      <GroupUserCard {...props} />
    </SystemFeedbackProvider>,
    container
  );
};

const renderGroupBanner = (container: Element, props: BannerProps) => {
  unmountComponentAtNode(container); // make sure we aren't double-rendering components
  render(<Banner {...props} />, container);
};

const ConfigureGroupV2Service = {
  initializeUnificationOptInModal,
  renderGroupUserCard,
  renderGroupBanner
};

Object.assign(Roblox, {
  ConfigureGroupV2Service
});
