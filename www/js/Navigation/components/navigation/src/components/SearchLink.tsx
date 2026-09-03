import { MouseEventHandler, useState } from "react";
import ClassNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { Link } from "@rbx/core-ui";
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
  const { translate } = useTranslation();

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
          <span className={ClassNames(gameSearchLink.icon, "navbar-list-option-icon")} />
          <span className="navbar-list-option-text">{searchQuery}</span>
          <span className="navbar-list-option-suffix">
            {translate("Label.sSearchPhraseV2", {
              location: translate(gameSearchLink.label),
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
        <span className={ClassNames(gameSearchLink.icon, "navbar-list-option-icon")} />
        <span className="navbar-list-option-text">{searchQuery}</span>
        <span className="navbar-list-option-suffix">
          {translate("Label.sSearchPhraseV2", {
            location: translate(gameSearchLink.label),
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
  const { translate } = useTranslation();
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
        <span className={ClassNames(avatarSearchLink.icon, "navbar-list-option-icon")} />
        <span className="navbar-list-option-text">{query}</span>
        <span className="navbar-list-option-suffix">
          {translate("Label.sSearchPhraseV2", {
            location: translate(avatarSearchLink.label),
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
  const { translate } = useTranslation();

  const { url, label, icon } = suggestion;

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
        <span className={ClassNames(icon, "navbar-list-option-icon")} />
        <span className="navbar-list-option-text">{searchInput.toLowerCase()}</span>
        <span className="navbar-list-option-suffix">
          {translate("Label.sSearchPhraseV2", {
            location: translate(label),
          })}
        </span>
      </Link>
    </li>
  );
}
