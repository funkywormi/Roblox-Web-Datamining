import React, { useCallback, useMemo } from 'react';
import { createSystemFeedback } from 'react-style-guide';
import { QueryClient } from '@tanstack/react-query';
import {
  GroupManagementRootProviders,
  GroupManagementSurface,
  GroupRoles
} from '@rbx/group-management';
import { NativeName, Locale } from '@rbx/intl';
import { useTheme } from 'react-utilities';
import RobloxIntlTranslationProvider from '../providers/RobloxIntlTranslationProvider';
import { CommunityProductFeaturesContextProvider } from '../../shared/contexts/CommunityProductFeaturesContext';

// @hello-pangea/dnd (peer dependency of @rbx/group-management) calls React.useId,
// which was added in React 18. This WebApp runs on React 17, so we polyfill it here.
// This must run at module load, before GroupRoles renders.
let rbxUseIdCounter = 0;
if (!('useId' in React)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (React as any).useId = function useId(): string {
    const [id] = React.useState(() => {
      rbxUseIdCounter += 1;
      return `:r${rbxUseIdCounter.toString(32)}:`;
    });
    return id;
  };
}

const defaultLocaleInfo = {
  locale: Locale.English,
  nativeName: NativeName.English
};
const translationResourceProvider = new RobloxIntlTranslationProvider(defaultLocaleInfo);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

export type GroupRolesContainerProps = {
  groupId: number;
  userId: number;
};

function GroupRolesInner({ groupId, userId }: GroupRolesContainerProps): JSX.Element {
  const theme = useTheme();
  const group = useMemo(() => ({ id: groupId }), [groupId]);
  const user = useMemo(() => ({ id: userId }), [userId]);
  const navigation = useMemo(
    () => ({
      currentRoleId: null,
      navigateToRole: null,
      getUserProfileUrl: (uid: number) => `/users/${uid}/profile`
    }),
    []
  );

  const showToast = useCallback((message: string, isError?: boolean) => {
    if (isError) {
      systemFeedbackService.warning(message);
    } else {
      systemFeedbackService.success(message);
    }
  }, []);

  return (
    <GroupManagementRootProviders
      surface={GroupManagementSurface.Community}
      group={group}
      user={user}
      navigation={navigation}
      theme={theme}
      translationProvider={translationResourceProvider}
      queryClient={queryClient}
      showToast={showToast}>
      <GroupRoles />
    </GroupManagementRootProviders>
  );
}

function GroupRolesContainer({ groupId, userId }: GroupRolesContainerProps): JSX.Element {
  return (
    <div className='configure-group-roles-v2'>
      <SystemFeedback />
      <CommunityProductFeaturesContextProvider groupId={groupId}>
        <GroupRolesInner groupId={groupId} userId={userId} />
      </CommunityProductFeaturesContextProvider>
    </div>
  );
}

export default GroupRolesContainer;
