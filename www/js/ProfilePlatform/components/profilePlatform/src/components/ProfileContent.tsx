import { Fragment, useMemo } from "react";
import { Component } from "@rbx/profile-platform";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";
import useComponentsFromJson from "../hooks/useComponentsFromJson";

const PROFILE_COMPONENTS = new Set([
  Component.About,
  Component.CurrentlyWearing,
  Component.Store,
  Component.Friends,
  Component.Collections,
  Component.Communities,
  Component.FavoriteExperiences,
  Component.Experiences,
  Component.RobloxBadges,
  Component.PlayerBadges,
  Component.TrustedFriendModal,
]);

const ProfileContent = () => {
  const { profileData } = useProfilePlatformContext();
  const componentsFromJson = useComponentsFromJson();

  const content = useMemo(() => {
    const componentOrdering: Component[] = profileData?.componentOrdering ?? [];
    return componentOrdering
      .filter(component => PROFILE_COMPONENTS.has(component))
      .map(component => <Fragment key={component}>{componentsFromJson[component]}</Fragment>);
  }, [profileData, componentsFromJson]);

  return <div className="profile-content padding-top-xxlarge">{content}</div>;
};

export default ProfileContent;
