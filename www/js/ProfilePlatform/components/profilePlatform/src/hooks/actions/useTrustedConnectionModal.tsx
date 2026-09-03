import { useState, useCallback } from "react";
import { TrustedFriendsModal } from "@rbx/friends-common";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";

const useTrustedConnectionModal = (): ActionHookResult => {
  const { profileData, refreshProfilePlatform } = useProfilePlatformContext();
  const profileId = profileData?.profileId;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handler = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const Component = () => {
    if (!profileId) return null;
    return (
      <TrustedFriendsModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onComplete={() => refreshProfilePlatform().catch(() => undefined)}
        userId={Number(profileId)}
      />
    );
  };

  return { handler, Component };
};

export default useTrustedConnectionModal;
