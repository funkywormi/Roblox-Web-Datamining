import type { EntityData } from "../../../types";
import { EntityStore } from "../EntityStore";

export const USER_PROFILE_CONTENT_TYPE = "userProfile";

export const USER_PROFILE_DEFAULT_PATHS: readonly string[] = ["user_id", "userId"];

/** Camel-cased wire fields from user_profile_data.proto. */
export interface UserProfileData extends EntityData {
  userId?: number | string;
  username?: string;
  displayName?: string;
  isVerified?: boolean;
  previousUsernames?: string[];
}

export class UserProfileStore extends EntityStore<UserProfileData> {}
