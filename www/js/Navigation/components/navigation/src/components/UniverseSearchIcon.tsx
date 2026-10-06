import { MouseEventHandler } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import NavIcon from "./NavIcon";

export default function UniverseSearchIcon({
  toggleUniverseSearch,
}: {
  toggleUniverseSearch: MouseEventHandler;
}) {
  const t = useTranslations("CommonUI.Features");
  return (
    <li className="rbx-navbar-right-search">
      <button
        type="button"
        className="rbx-menu-item btn-navigation-nav-search-white-md"
        aria-label={t("Label.sSearch")}
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
