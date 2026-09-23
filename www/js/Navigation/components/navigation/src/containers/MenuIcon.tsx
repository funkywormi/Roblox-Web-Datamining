import { Fragment } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { IconButton as CoreUiIconButton } from "@rbx/core-ui";
import layoutConstants from "../constants/layoutConstants";
import NavIcon from "../components/NavIcon";
import SkipToMainContent from "../components/SkipToMainContent";
import { isAccountExperienceRevampEnabled } from "../util/accountExperienceUtils";
import { useIsTopNavFoundation } from "../util/topNavFoundationIxp";

const { headerMenuIconClickEvent } = layoutConstants;

export default function MenuIcon() {
  const { iconTypes } = CoreUiIconButton;
  const isFoundation = useIsTopNavFoundation();
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
      {authenticatedUser() != null &&
        (isFoundation ? (
          // Foundation's IconButton paints a background on every variant; the header hamburger is
          // transparent, so only the glyph is swapped and .menu-button keeps its responsive rules.
          <button
            type="button"
            className="menu-button btn-navigation-nav-menu-md"
            title="nav menu"
            onClick={onClickMenuIcon}
          >
            <NavIcon legacyClass="" name="icon-regular-three-bars-horizontal" size="XLarge" />
          </button>
        ) : (
          <CoreUiIconButton
            className="menu-button"
            iconType={iconTypes.navigation}
            iconName="nav-menu"
            onClick={onClickMenuIcon}
          />
        ))}
    </Fragment>
  );
}
