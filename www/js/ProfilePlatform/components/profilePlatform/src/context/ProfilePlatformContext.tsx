import React, { createContext, useContext, JSX, useMemo } from "react";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import {
  Action,
  Component,
  ProfileType,
  useFetchProfilePlatform,
  UseFetchProfilePlatformResponse,
} from "@rbx/profile-platform";

export interface ProfilePlatformContextProps {
  profileId: string;
  profileType: ProfileType;
}

export type ProfilePlatformContextValue = ProfilePlatformContextProps &
  UseFetchProfilePlatformResponse & { profileSessionId: string };

export const ProfilePlatformContext = createContext<ProfilePlatformContextValue | undefined>(
  undefined,
);

export const useProfilePlatformContext = (): ProfilePlatformContextValue => {
  const context = useContext(ProfilePlatformContext);
  if (!context) {
    throw new Error(
      "useProfilePlatformContext must be used within a ProfilePlatformContextProvider",
    );
  }
  return context;
};

export const ProfilePlatformContextProvider = (
  props: ProfilePlatformContextProps & { children: React.ReactNode },
): JSX.Element => {
  const { profileId, profileType, children } = props;
  const supportedActions = useMemo(() => Object.values(Action), []);

  const trustedFriendLinkCode = new URLSearchParams(window.location.search).get(
    "trustedFriendLinkCode",
  );

  const additionalComponents = useMemo(() => {
    const components: { component: Component; context?: string }[] = [
      { component: Component.ProfileBackground },
    ];
    if (trustedFriendLinkCode) {
      components.push({
        component: Component.TrustedFriendModal,
        context: trustedFriendLinkCode,
      });
    }
    return components;
  }, [trustedFriendLinkCode]);

  const { hasError, isLoading, profileData, refreshProfilePlatform } = useFetchProfilePlatform(
    profileId,
    profileType,
    supportedActions,
    undefined,
    additionalComponents,
  );
  const profileSessionId = useMemo(() => uuidService.generateRandomUuid(), []);

  const profilePlatformContextValue = useMemo(
    () => ({
      profileId,
      profileType,
      profileSessionId,
      hasError,
      isLoading,
      profileData,
      refreshProfilePlatform,
    }),
    [
      profileId,
      profileType,
      profileSessionId,
      hasError,
      isLoading,
      profileData,
      refreshProfilePlatform,
    ],
  );

  return (
    <ProfilePlatformContext.Provider value={profilePlatformContextValue}>
      {children}
    </ProfilePlatformContext.Provider>
  );
};
