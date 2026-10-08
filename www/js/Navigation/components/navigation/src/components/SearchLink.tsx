import { MouseEventHandler, useState } from "react";
import ClassNames from "classnames";
import { useTranslations } from "@rbx/www-common/i18n";

import {
  Thumbnail2d,
  ThumbnailTypes,
  DefaultThumbnailSize,
  ThumbnailFormat,
} from "@rbx/thumbnails";
import {
  GamesAutocompleteSuggestionEntryType,
  TAvatarAutocompleteSuggestionEntry,
  TGamesAutocompleteSuggestionEntry,
} from "../services/searchService";
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

  if (type === GamesAutocompleteSuggestionEntryType.GameSuggestion) {
    return (
      <li className={listClass}>
        <Link
          className="new-navbar-search-anchor"
          url={gameSearchLink.url + encodeURIComponent(searchQuery)}
          onClick={onClick}
        >
          <NavIcon
            legacyClass={gameSearchLink.icon}
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
            <Thumbnail2d
              type={ThumbnailTypes.gameIcon}
              size={DefaultThumbnailSize}
              targetId={universeId}
              containerClass="thumbnail-icon"
              format={ThumbnailFormat.jpeg}
              onLoad={() => {
                setIsThumbnailVisible(true);
              }}
            />
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
          legacyClass={gameSearchLink.icon}
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
          legacyClass={avatarSearchLink.icon}
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

  const { url, label, icon, foundationIcon, isTopSearchResult } = suggestion;

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
        <NavIcon
          legacyClass={icon}
          name={foundationIcon}
          size="Medium"
          className="navbar-list-option-icon"
        />
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
