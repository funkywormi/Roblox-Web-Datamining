import { useEffect, useState } from "react";
import { useRelayEnvironment } from "react-relay";
import { fetchQuery } from "relay-runtime";
import { authenticatedUser } from "header-scripts";
import AccountSettingsQueryNode from "./__generated__/AccountSettingsQuery.graphql";
import type {
  AccountSettingsQuery,
  AccountSettingsQuery$data,
} from "./__generated__/AccountSettingsQuery.graphql";

type NotificationType = NonNullable<
  NonNullable<AccountSettingsQuery$data["userById"]>["settings"]
>["notifications"]["promotionalOffers"];

type SelectedOption = NonNullable<
  NonNullable<NotificationType>["channels"][number]["preference"]["selectedOption"]
>;

export type NotificationTypePreferenceResult = {
  selectedOption: SelectedOption | null;
};

/**
 * Fetches a notification type's channel preference via the AccountSettingsQuery.
 * Returns the selected option for the matched channel, or null if not set.
 * Returns undefined while loading.
 */
const useNotificationTypePreference = (
  notificationType: "promotionalOffers",
  channel: string,
): NotificationTypePreferenceResult | undefined => {
  const environment = useRelayEnvironment();
  const [result, setResult] = useState<NotificationTypePreferenceResult | undefined>(undefined);

  useEffect(() => {
    const subscription = fetchQuery<AccountSettingsQuery>(environment, AccountSettingsQueryNode, {
      userId: String(authenticatedUser.id),
    }).subscribe({
      next: data => {
        const typeData = data.userById?.settings?.notifications?.[notificationType];
        if (!typeData) {
          setResult({ selectedOption: null });
          return;
        }

        const matchedChannel = typeData.channels.find(c => c.channel.value === channel);

        setResult({ selectedOption: matchedChannel?.preference.selectedOption ?? null });
      },
      error: () => {
        setResult({ selectedOption: null });
      },
    });

    return () => subscription.unsubscribe();
  }, [environment, notificationType, channel]);

  return result;
};

export default useNotificationTypePreference;
