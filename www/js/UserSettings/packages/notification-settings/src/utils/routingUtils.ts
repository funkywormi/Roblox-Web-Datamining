import { type TSettingsPage } from "@rbx/user-settings";
import { type NotificationCategory } from "../types";
import { CATEGORY_KEYS } from "../constants/notificationConstants";
import { resolveCategoryPresentation } from "./presentationUtils";
// Base path
export const BASE_NOTIFICATIONS_PATH = "/notifications";

// Route param names (used in route definitions and useParams)
export const ROUTE_PARAMS = {
  categoryKey: "categoryKey",
  settingKey: "settingKey",
  groupId: "groupId",
} as const;

// Other route keys
export const ROUTE_KEYS = {
  myCommunities: "my-communities",
  myExperiences: "my-experiences",
} as const;

// Route templates for React Router
export const ROUTES = {
  categories: BASE_NOTIFICATIONS_PATH,
  deviceNotifications: `${BASE_NOTIFICATIONS_PATH}/device-notifications`,
  category: `${BASE_NOTIFICATIONS_PATH}/:${ROUTE_PARAMS.categoryKey}`,
  setting: `${BASE_NOTIFICATIONS_PATH}/:${ROUTE_PARAMS.categoryKey}/:${ROUTE_PARAMS.settingKey}`,
  myCommunities: `${BASE_NOTIFICATIONS_PATH}/${CATEGORY_KEYS.communities}/${ROUTE_KEYS.myCommunities}`,
  communitySettings: `${BASE_NOTIFICATIONS_PATH}/${CATEGORY_KEYS.communities}/${ROUTE_KEYS.myCommunities}/:${ROUTE_PARAMS.groupId}`,
  myExperiences: `${BASE_NOTIFICATIONS_PATH}/${CATEGORY_KEYS.experiences}/${ROUTE_KEYS.myExperiences}`,
} as const;

// Path builders
export const buildCategoryPath = (categoryKey: string): string =>
  `${BASE_NOTIFICATIONS_PATH}/${categoryKey}`;

export const buildSettingPath = (categoryKey: string, settingKey: string): string =>
  `${BASE_NOTIFICATIONS_PATH}/${categoryKey}/${settingKey}`;

export const buildCommunitySettingsPath = (groupId: number | string): string =>
  `${BASE_NOTIFICATIONS_PATH}/Communities/${ROUTE_KEYS.myCommunities}/${groupId}`;

/**
 * Converts categories to TSettingsPage[] for rendering in a list.
 */
export const buildCategoryPages = (categories: readonly NotificationCategory[]): TSettingsPage[] =>
  categories.map(row => {
    const { titleTranslationKey, descriptionTranslationKey } = resolveCategoryPresentation(
      row.category.value,
    );
    return {
      name: row.category.value,
      path: buildCategoryPath(row.category.value),
      titleTranslationKey,
      descriptionTranslationKey,
    };
  });
