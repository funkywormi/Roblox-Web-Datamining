import { Fragment } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { IconButton } from "@rbx/core-ui";
import layoutConstants from "../constants/layoutConstants";
import SkipToMainContent from "../components/SkipToMainContent";
import { isAccountExperienceRevampEnabled } from "../util/accountExperienceUtils";

const { headerMenuIconClickEvent } = layoutConstants;

export default function MenuIcon() {
  const { iconTypes } = IconButton;
  const onClickMenuIcon = () => {
    document.dispatchEvent(new CustomEvent(headerMenuIconClickEvent.name));
  };

  // Hide menu icon when account experience revamp is enabled
  if (isAccountExperienceRevampEnabled()) {
    return null;
  }

  return (
    <Fragment>
      <SkipToMainContent />
      {authenticatedUser() != null && (
        <IconButton
          className="menu-button"
          iconType={iconTypes.navigation}
          iconName="nav-menu"
          onClick={onClickMenuIcon}
        />
      )}
    </Fragment>
  );
}
