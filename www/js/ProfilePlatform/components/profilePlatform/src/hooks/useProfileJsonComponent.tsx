import { ComponentsResponse } from "@rbx/profile-platform";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";

const useProfileJsonComponent = <T extends keyof ComponentsResponse>(
  component: T,
): ComponentsResponse[T] | null => {
  const { profileData } = useProfilePlatformContext();
  return profileData?.components[component] ?? null;
};

export default useProfileJsonComponent;
