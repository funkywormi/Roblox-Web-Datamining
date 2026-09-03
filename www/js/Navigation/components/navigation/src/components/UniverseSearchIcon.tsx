import { MouseEventHandler } from "react";
import { useTranslation } from "@rbx/core-scripts/react";

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
        <span className="icon-nav-search-white" aria-hidden="true" />
      </button>
    </li>
  );
}
