import { useMemo } from "react";
import { Component } from "@rbx/profile-platform";
import useProfileJsonComponent from "../../hooks/useProfileJsonComponent";
import PlayerBadges from "./PlayerBadges";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";

const PlayerBadgesContainer = () => {
  const { profileData } = useProfilePlatformContext();
  const playerBadges = useProfileJsonComponent(Component.PlayerBadges);

  const badges = useMemo(
    () => playerBadges?.badges.map(badgeId => ({ id: badgeId })) ?? [],
    [playerBadges],
  );

  if (badges.length === 0) {
    return null;
  }

  return <PlayerBadges userId={profileData?.profileId ?? ""} playerBadges={badges} />;
};

export default PlayerBadgesContainer;
