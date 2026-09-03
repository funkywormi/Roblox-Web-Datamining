import { JSX, createContext, useContext, useMemo, type ReactNode } from "react";
import { useRelayEnvironment } from "react-relay";
import { fetchQuery } from "relay-runtime";
import type { NotificationSettingsContainerQuery } from "../components/__generated__/NotificationSettingsContainerQuery.graphql";
import NotificationSettingsContainerQueryNode from "../components/__generated__/NotificationSettingsContainerQuery.graphql";

type RefetchNotificationSettings = () => void;

const NotificationSettingsRefetchContext = createContext<RefetchNotificationSettings | null>(null);

type ProviderProps = {
  userId: string;
  children: ReactNode;
};

/**
 * Provides a callback for forcing a network refetch of the root notifications query.
 *
 * TEMPORARY: used to re-sync the UI after toggling aggregate settings like
 * `AggregatedDesktopNotifications` or `AllowEnable*Notifications`, which cascade
 * to other channels server-side. Once we have proper Relay mutations with declarative
 * updaters for these settings, the cache will stay in sync without a full refetch.
 */
export const NotificationSettingsRefetchProvider = ({
  userId,
  children,
}: ProviderProps): JSX.Element => {
  const environment = useRelayEnvironment();

  const refetch = useMemo<RefetchNotificationSettings>(
    () => () => {
      fetchQuery<NotificationSettingsContainerQuery>(
        environment,
        NotificationSettingsContainerQueryNode,
        { userId },
        { fetchPolicy: "network-only" },
      ).subscribe({});
    },
    [environment, userId],
  );

  return (
    <NotificationSettingsRefetchContext.Provider value={refetch}>
      {children}
    </NotificationSettingsRefetchContext.Provider>
  );
};

const noop: RefetchNotificationSettings = () => {
  // no-op when no provider is mounted (e.g. in tests)
};

export const useRefetchNotificationSettings = (): RefetchNotificationSettings =>
  useContext(NotificationSettingsRefetchContext) ?? noop;
