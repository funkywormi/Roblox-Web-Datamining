import { MouseEventHandler, useState } from "react";
import ClassNames from "classnames";
import { useTranslations } from "@rbx/www-common/i18n";
import {
  GamesAutocompleteSuggestionEntryType,
  TAvatarAutocompleteSuggestionEntry,
  TGamesAutocompleteSuggestionEntry,
} from "../services/searchTypes";
import { getNavCapability } from "../util/navCapabilities";
import links, { UniversalSearchLink } from "../constants/linkConstants";
import Link from "./NavLink";
import NavIcon from "./NavIcon";

const { gameSearchLink, avatarSearchLink } = links;

export function AutocompleteSearchLink({
  selected,
  suggestion,
  onClick,
}: {
  selected: boolean;
  suggestion: TGamesAutocompleteSuggestionEntry;
  onClick: MouseEventHandler;
}) {
  const t = useTranslations("CommonUI.Features");

  const listClass = ClassNames("navbar-search-option rbx-clickable-li", {
    "new-selected": selected,
  });
  const { type, universeId, searchQuery } = suggestion;
  const [isThumbnailVisible, setIsThumbnailVisible] = useState(false);
  const GameIconThumbnail = getNavCapability("GameIconThumbnail");

  if (type === GamesAutocompleteSuggestionEntryType.GameSuggestion) {
    return (
      <li className={listClass}>
        <Link
          className="new-navbar-search-anchor"
          url={gameSearchLink.url + encodeURIComponent(searchQuery)}
          onClick={onClick}
        >
          <NavIcon
            name={gameSearchLink.foundationIcon}
            size="Medium"
            className="navbar-list-option-icon"
          />
          <span className="navbar-list-option-text">{searchQuery}</span>
          <span className="navbar-list-option-suffix">
            {t("Label.sSearchPhraseV2", {
              location: t.has(gameSearchLink.label) ? t(gameSearchLink.label) : "",
            })}
          </span>
          <span
            className={ClassNames("navbar-list-option-thumbnail", {
              "navbar-list-option-thumbnail-visible": isThumbnailVisible,
            })}
          >
            <span className="background-icon" />
            {GameIconThumbnail ? (
              <GameIconThumbnail
                universeId={universeId}
                onLoad={() => {
                  setIsThumbnailVisible(true);
                }}
              />
            ) : null}
          </span>
        </Link>
      </li>
    );
  }

  return (
    <li className={listClass}>
      <Link
        className="new-navbar-search-anchor"
        url={gameSearchLink.url + encodeURIComponent(searchQuery)}
        onClick={onClick}
      >
        <NavIcon
          name={gameSearchLink.foundationIcon}
          size="Medium"
          className="navbar-list-option-icon"
        />
        <span className="navbar-list-option-text">{searchQuery}</span>
        <span className="navbar-list-option-suffix">
          {t("Label.sSearchPhraseV2", {
            location: t.has(gameSearchLink.label) ? t(gameSearchLink.label) : "",
          })}
        </span>
      </Link>
    </li>
  );
}

export function AvatarAutocompleteSearchLink({
  selected,
  suggestion,
  onClick,
}: {
  selected: boolean;
  suggestion: TAvatarAutocompleteSuggestionEntry;
  onClick: MouseEventHandler;
}) {
  const t = useTranslations("CommonUI.Features");
  const listClass = ClassNames("navbar-search-option rbx-clickable-li", {
    "new-selected": selected,
  });
  const query = suggestion.Query;

  return (
    <li className={listClass}>
      <Link
        className="new-navbar-search-anchor"
        url={avatarSearchLink.url + encodeURIComponent(query)}
        onClick={onClick}
      >
        <NavIcon
          name={avatarSearchLink.foundationIcon}
          size="Medium"
          className="navbar-list-option-icon"
        />
        <span className="navbar-list-option-text">{query}</span>
        <span className="navbar-list-option-suffix">
          {t("Label.sSearchPhraseV2", {
            location: t.has(avatarSearchLink.label) ? t(avatarSearchLink.label) : "",
          })}
        </span>
      </Link>
    </li>
  );
}

export function SearchLink({
  selected,
  searchInput,
  suggestion,
  onClick,
}: {
  selected: boolean;
  searchInput: string;
  suggestion: UniversalSearchLink;
  onClick: MouseEventHandler;
}) {
  const t = useTranslations("CommonUI.Features");

  const { url, label, foundationIcon, isTopSearchResult } = suggestion;

  const listClass = ClassNames("navbar-search-option rbx-clickable-li", {
    "new-selected": selected,
  });
  return (
    <li className={listClass}>
      <Link
        className="new-navbar-search-anchor"
        url={url + encodeURIComponent(searchInput)}
        onClick={onClick}
      >
        <NavIcon name={foundationIcon} size="Medium" className="navbar-list-option-icon" />
        <span className="navbar-list-option-text">{searchInput.toLowerCase()}</span>
        {!isTopSearchResult && (
          <span className="navbar-list-option-suffix">
            {t("Label.sSearchPhraseV2", {
              location: t.has(label) ? t(label) : "",
            })}
          </span>
        )}
      </Link>
    </li>
  );
}
