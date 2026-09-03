import { callBehaviour } from "@rbx/core-scripts/guac";

type GetPushNotificationUpsellResponse = {
  displayPushNotificationUpsell?: boolean;
};

export async function getPushNotificationUpsellEnabled(): Promise<boolean> {
  const result = await callBehaviour<GetPushNotificationUpsellResponse>("account-settings-ui");
  return Boolean(result.displayPushNotificationUpsell);
}
