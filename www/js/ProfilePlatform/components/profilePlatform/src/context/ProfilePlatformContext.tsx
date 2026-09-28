import React, { createContext, useCallback, useContext, JSX, useMemo } from "react";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import {
  Action,
  Component,
  ProfileType,
  useFetchProfilePlatform,
  UseFetchProfilePlatformResponse,
} from "@rbx/profile-platform";
import { useExperiments } from "@rbx/profile-common/ExperimentsContext";
import { ExperimentKey } from "@rbx/profile-common/experimentationUtils";
import useFetchProfileActions from "../hooks/useFetchProfileActions";

export interface ProfilePlatformContextProps {
  profileId: string;
  profileType: ProfileType;
}

export type ProfilePlatformContextValue = ProfilePlatformContextProps &
  UseFetchProfilePlatformResponse & { profileSessionId: string; isActionsLoaded: boolean };

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
  const { isInTreatment, isLoaded } = useExperiments();
  const isActionsV2Enabled = isLoaded
    ? isInTreatment(ExperimentKey.IsActionsV2Enabled) === true
    : undefined;

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

  // Actions V2 support is left undefined so the full profile doesn't refetch when the experiment
  // resolves. The Actions this returns are only used as a fallback if useFetchProfileActions fails.
  const {
    hasError,
    isLoading,
    profileData: baseProfileData,
    refreshProfilePlatform: refreshBaseProfilePlatform,
  } = useFetchProfilePlatform(
    profileId,
    profileType,
    supportedActions,
    undefined,
    additionalComponents,
  );
  const { actions, isActionsLoaded, hasActionsError, refreshActions } = useFetchProfileActions(
    profileId,
    profileType,
    supportedActions,
    isActionsV2Enabled,
  );
  const profileSessionId = useMemo(() => uuidService.generateRandomUuid(), []);

  const profileData = useMemo(() => {
    if (!baseProfileData) {
      return undefined;
    }
    const { Actions: baseActions, ...components } = baseProfileData.components;
    const resolvedActions = actions ?? (hasActionsError ? baseActions : undefined);
    return {
      ...baseProfileData,
      components: resolvedActions ? { ...components, Actions: resolvedActions } : components,
    };
  }, [baseProfileData, actions, hasActionsError]);

  const refreshProfilePlatform = useCallback(
    async (setLoading?: boolean) => {
      await Promise.all([refreshBaseProfilePlatform(setLoading), refreshActions()]);
    },
    [refreshBaseProfilePlatform, refreshActions],
  );

  const profilePlatformContextValue = useMemo(
    () => ({
      profileId,
      profileType,
      profileSessionId,
      hasError,
      isLoading,
      profileData,
      refreshProfilePlatform,
      isActionsLoaded,
    }),
    [
      profileId,
      profileType,
      profileSessionId,
      hasError,
      isLoading,
      profileData,
      refreshProfilePlatform,
      isActionsLoaded,
    ],
  );

  return (
    <ProfilePlatformContext.Provider value={profilePlatformContextValue}>
      {children}
    </ProfilePlatformContext.Provider>
  );
};
