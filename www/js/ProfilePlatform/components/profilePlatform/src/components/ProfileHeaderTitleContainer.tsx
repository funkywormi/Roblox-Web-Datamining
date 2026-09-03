import { useTranslation } from "@rbx/core-scripts/react";
import { Component } from "@rbx/profile-platform";
import { PLUS_BADGE_ARIA_LABEL, PLUS_BADGE_ARIA_LABEL_KEY } from "@rbx/identity-badges/constants";
import useProfileJsonComponent from "../hooks/useProfileJsonComponent";
import DisplayNameBadges from "./DisplayNameBadges";

const ProfileHeaderTitleContainer = () => {
  const { translate } = useTranslation();
  const userProfileHeaderData = useProfileJsonComponent(Component.UserProfileHeader);
  const name = userProfileHeaderData?.names.primaryName;
  const isVerified = userProfileHeaderData?.isVerified;
  const isPremium = userProfileHeaderData?.isPremium;
  const isRobloxPlus = userProfileHeaderData?.isRobloxPlus;
  const isRobloxAdmin = userProfileHeaderData?.isRobloxAdmin;

  return (
    <span className="items-center gap-xsmall flex min-width-0">
      <span
        id="profile-header-title-container-name"
        className="text-heading-large min-width-0 text-truncate-end text-no-wrap"
      >
        {name}
      </span>
      <DisplayNameBadges
        isVerified={isVerified}
        isRobloxPlus={isRobloxPlus}
        isPremium={isPremium}
        isRobloxAdmin={isRobloxAdmin}
        plusBadgeAriaLabel={translate(PLUS_BADGE_ARIA_LABEL_KEY, undefined, PLUS_BADGE_ARIA_LABEL)}
      />
    </span>
  );
};

export default ProfileHeaderTitleContainer;
