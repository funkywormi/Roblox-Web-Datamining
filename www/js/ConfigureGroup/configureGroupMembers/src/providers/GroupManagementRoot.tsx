import type { FunctionComponent, PropsWithChildren } from 'react';
import React, { useState } from 'react';
import type { QueryClientConfig } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { TranslationResourceProvider } from '@rbx/intl';
import { LocalizationProvider } from '@rbx/intl';
import type { ThemeMode } from '@rbx/ui';
import { DialogProvider, UIThemeProvider } from '@rbx/ui';
import { useGetMigrationStatus } from '../queries/migrationQueries';
import type {
  AuthenticatedUser,
  GroupData,
  GroupManagementLogger,
  GroupManagementNavigation,
  GroupManagementStudio,
  GroupManagementSurface,
} from '../utils/types';
import { MIGRATION_STATUS } from '../utils/unificationUtils';
import GroupManagementProvider from './GroupManagementProvider';

const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
};

export type GroupManagementThemeModeConfig = {
  bedev2BaseUrl: string;
  currentUser?: AuthenticatedUser | null;
};

export type GroupManagementRootProvidersProps = PropsWithChildren<{
  group: GroupData;
  user: AuthenticatedUser;
  surface: GroupManagementSurface;
  navigation: GroupManagementNavigation;
  showToast: (message: string, isError?: boolean) => void;
  translationProvider: TranslationResourceProvider;
  theme?: ThemeMode;
  queryClient?: QueryClient;
  studio?: GroupManagementStudio;
  unifiedLogger?: GroupManagementLogger;
}>;

type GroupManagementRootProvidersContentProps = Omit<
  GroupManagementRootProvidersProps,
  'queryClient'
>;

/**
 * Composes every generic provider group-management needs (react-query, intl,
 * UI theme, dialogs) around {@link GroupManagementProvider} so consumers only
 * supply host-specific values. Use {@link GroupManagementProvider} directly when
 * the host already sets up these providers app-wide.
 */
const GroupManagementRootProviders: FunctionComponent<GroupManagementRootProvidersProps> = ({
  queryClient,
  ...props
}) => {
  const [fallbackQueryClient] = useState(() => new QueryClient(defaultQueryClientConfig));
  const activeQueryClient = queryClient ?? fallbackQueryClient;

  return (
    <QueryClientProvider client={activeQueryClient}>
      <GroupManagementRootProvidersContent {...props} />
    </QueryClientProvider>
  );
};

const GroupManagementRootProvidersContent: FunctionComponent<
  GroupManagementRootProvidersContentProps
> = ({
  group,
  user,
  surface,
  navigation,
  showToast,
  translationProvider,
  theme,
  studio,
  unifiedLogger,
  children,
}) => {
  const { data: migrationStatus } = useGetMigrationStatus(group.id);
  const isUnified = migrationStatus?.status === MIGRATION_STATUS.MIGRATED;

  return (
    <LocalizationProvider provider={translationProvider}>
      <UIThemeProvider theme={theme}>
        <DialogProvider>
          <GroupManagementProvider
            surface={surface}
            group={group}
            navigation={navigation}
            user={user}
            showToast={showToast}
            isUnified={isUnified}
            studio={studio}
            unifiedLogger={unifiedLogger}>
            {children}
          </GroupManagementProvider>
        </DialogProvider>
      </UIThemeProvider>
    </LocalizationProvider>
  );
};

export default GroupManagementRootProviders;
