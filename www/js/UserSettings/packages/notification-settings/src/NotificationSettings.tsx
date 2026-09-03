import { JSX, ReactNode, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RelayEnvironmentProvider } from "react-relay";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { TranslationProvider, queryClient, useTranslation } from "@rbx/core-scripts/react";
import { ProgressCircle } from "@rbx/foundation-ui";
import { SnackbarProvider } from "@rbx/user-settings";
import { RelayEnvironment } from "./RelayEnvironment";
import { NotificationSettingsContainer } from "./components/NotificationSettingsContainer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NotificationSettingsRefetchProvider } from "./hooks/useRefetchNotificationSettings";
import { notificationSettingsTranslations } from "./translation.config";
import { ErrorFallback } from "./components/ErrorFallback";
import translationConstants from "./constants/translationConstants";

const NotificationSettingsLayout = ({ children }: { children: ReactNode }): JSX.Element => {
  const { translate } = useTranslation();
  return (
    <div
      id="notification-settings"
      data-testid="notification-settings"
      className="settings-container-v2"
    >
      <div className="settings-v2-header" id="rbx-notifications-settings-header">
        <h2>{translate(translationConstants.notificationsHeading)}</h2>
      </div>
      {children}
    </div>
  );
};

/** Providers that need translations, so they can't sit alongside TranslationProvider. */
const TranslatedProviders = ({ children }: { children: ReactNode }): JSX.Element => {
  const { translate } = useTranslation();
  return (
    <SnackbarProvider translatedCloseLabel={translate(translationConstants.actionClose)}>
      <RelayEnvironmentProvider environment={RelayEnvironment}>
        <NotificationSettingsRefetchProvider userId={String(authenticatedUser.id)}>
          {children}
        </NotificationSettingsRefetchProvider>
      </RelayEnvironmentProvider>
    </SnackbarProvider>
  );
};

const NotificationSettings = (): JSX.Element => (
  <QueryClientProvider client={queryClient}>
    <TranslationProvider config={notificationSettingsTranslations}>
      <TranslatedProviders>
        <NotificationSettingsLayout>
          <ErrorBoundary fallback={<ErrorFallback />}>
            <Suspense
              fallback={
                <ProgressCircle ariaLabel="Loading" size="Medium" variant="Indeterminate" />
              }
            >
              <NotificationSettingsContainer />
            </Suspense>
          </ErrorBoundary>
        </NotificationSettingsLayout>
      </TranslatedProviders>
    </TranslationProvider>
  </QueryClientProvider>
);

export default NotificationSettings;
