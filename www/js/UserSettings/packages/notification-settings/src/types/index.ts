import type { NotificationCategoriesListFragment$data } from "../components/__generated__/NotificationCategoriesListFragment.graphql";
import type { ChannelToggleFragment$data } from "../components/__generated__/ChannelToggleFragment.graphql";

export type NotificationCategory = NotificationCategoriesListFragment$data["categories"][number];

/** Align with `ROUTE_PARAMS` in `routingUtils.ts`. */
export type CategoryParams = Record<"categoryKey", string>;

export type SettingParams = Record<"categoryKey" | "settingKey", string>;

export type CommunitySettingsParams = Record<"groupId", string>;

type ChannelPreferenceData = ChannelToggleFragment$data["preference"];
type ChannelSelectedOptionData = NonNullable<ChannelPreferenceData["selectedOption"]>;

/**
 * Field-name constants for the NotificationChannel Relay fragment, used by
 * `commitLocalUpdate` call sites that need to mutate the store without a round-trip.
 *
 * The `satisfies` constraint ties each string to a key of the generated fragment
 * type. If the schema renames a field, these will fail to compile.
 */
export const CHANNEL_RELAY_FIELDS = {
  preference: "preference",
  selectedOption: "selectedOption",
  enabled: "enabled",
  value: "value",
} as const satisfies {
  preference: keyof ChannelToggleFragment$data;
  selectedOption: keyof ChannelPreferenceData;
  enabled: keyof ChannelSelectedOptionData;
  value: keyof ChannelSelectedOptionData;
};
