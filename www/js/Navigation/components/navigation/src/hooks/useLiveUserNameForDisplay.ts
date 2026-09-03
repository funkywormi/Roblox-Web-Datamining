import { useMemo } from "react";
import { UserProfileField, useUserProfiles } from "@rbx/user-profiles";
import type { AuthenticatedUser } from "@rbx/core-scripts/meta/user";

/**
 * Resolves the same label as legacy userUtil: display name when Display Names are enabled, else username.
 * Prefers User Profile API data so the chrome updates after rename without a full page reload. This fixes the legacy
 * issue where the display name is not updated after a rename until a reload.
 */
export const useLiveUserNameForDisplay = (user: AuthenticatedUser | null): string => {
  const { data } = useUserProfiles(user?.id == null ? [] : [user.id], [
    UserProfileField.Names.DisplayName,
    UserProfileField.Names.Username,
  ]);

  return useMemo(() => {
    if (user?.id == null) {
      return "";
    }
    const profile = data?.[user.id]?.names;
    return profile?.displayName ?? user.displayName ?? "";
  }, [data, user?.id, user?.displayName]);
};
