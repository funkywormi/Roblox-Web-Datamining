import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";

export function useIsOwnProfile(): boolean {
  const { profileId } = useProfilePlatformContext();

  // Get current user ID from global Roblox object
  const currentUserId = authenticatedUser()?.id;

  // Convert profileId to number for comparison
  const profileIdNumber = parseInt(profileId, 10);

  return currentUserId === profileIdNumber;
}
