import { Fragment } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import layoutConstants from "../constants/layoutConstants";
import NavIcon from "../components/NavIcon";
import SkipToMainContent from "../components/SkipToMainContent";
import { isAccountExperienceRevampEnabled } from "../util/accountExperienceUtils";

const { headerMenuIconClickEvent } = layoutConstants;

export default function MenuIcon() {
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
        // Foundation's IconButton paints a background on every variant; the header hamburger is
        // transparent, so .menu-button keeps its responsive rules.
        <button
          type="button"
          className="menu-button btn-navigation-nav-menu-md"
          title="nav menu"
          onClick={onClickMenuIcon}
        >
          <NavIcon name="icon-regular-three-bars-horizontal" size="XLarge" />
        </button>
      )}
    </Fragment>
  );
}
