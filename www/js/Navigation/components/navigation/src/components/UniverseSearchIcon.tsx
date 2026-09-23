import { MouseEventHandler } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import NavIcon from "./NavIcon";

export default function UniverseSearchIcon({
  toggleUniverseSearch,
}: {
  toggleUniverseSearch: MouseEventHandler;
}) {
  const { translate } = useTranslation();
  return (
    <li className="rbx-navbar-right-search">
      <button
        type="button"
        className="rbx-menu-item btn-navigation-nav-search-white-md"
        aria-label={translate("Label.sSearch")}
        onClick={toggleUniverseSearch}
      >
        <NavIcon
          legacyClass="icon-nav-search-white"
          name="icon-regular-magnifying-glass"
          size="XLarge"
        />
      </button>
    </li>
  );
}
