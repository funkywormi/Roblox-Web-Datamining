import { useEffect, useState } from "react";
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import { configurePrivateServerService } from "../services/configurePrivateServerService";
import { configurePrivateServerConstants } from "../constants/configurePrivateServerConstants";

type UsePrivateServerPrivacyOptions = {
  friendsAllowed: boolean;
  onForceDisableFriendsAllowed: () => Promise<void>;
};

export const usePrivateServerPrivacy = ({
  friendsAllowed,
  onForceDisableFriendsAllowed,
}: UsePrivateServerPrivacyOptions) => {
  const [displayPrivacyDisclaimer, setDisplayPrivacyDisclaimer] = useState(false);
  const [privacyRedirectLink, setPrivacyRedirectLink] = useState("");

  useEffect(() => {
    let isMounted = true;

    const apply = async () => {
      if (!CurrentUser?.isUnder13) {
        return;
      }

      const guacPolicy = await configurePrivateServerService.getAccountSettingsGuacPolicy();
      if (!isMounted || !guacPolicy?.isPrivateServerPrivacyV2Enabled) {
        return;
      }

      const userSettings = await configurePrivateServerService.getUserSettings();
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- isMounted can change during await
      if (!isMounted) {
        return;
      }

      if (userSettings?.privateServerPrivacy === "NoOne") {
        setDisplayPrivacyDisclaimer(true);
        setPrivacyRedirectLink(configurePrivateServerConstants.apiEndpoints.accountSettingsPageUrl);
        if (friendsAllowed) {
          await onForceDisableFriendsAllowed();
        }
      }
    };

    apply();

    return () => {
      isMounted = false;
    };
  }, [friendsAllowed, onForceDisableFriendsAllowed]);

  return {
    displayPrivacyDisclaimer,
    privacyRedirectLink,
  };
};
