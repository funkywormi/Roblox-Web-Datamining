import { KeyboardEvent } from "react";
import Intl from "@rbx/core-scripts/intl";
import links, { UniversalSearchLink } from "../constants/linkConstants";
import searchConstants from "../constants/searchConstants";
import {
  GamesAutocompleteSuggestionEntryType,
  TAvatarAutocompleteSuggestionEntry,
  TGamesAutocompleteSuggestionEntry,
} from "../services/searchService";

export type Suggestion =
  | TGamesAutocompleteSuggestionEntry
  | TAvatarAutocompleteSuggestionEntry
  | UniversalSearchLink;

export type SearchType = "avatar" | "keyword" | "game";

export type DefaultSearchType =
  | "defaultPlayers"
  | "defaultShops"
  | "defaultGroups"
  | "defaultLibrary"
  | "defaultGames";

export const getAutocompleteSearchType = (
  suggestion: TGamesAutocompleteSuggestionEntry | TAvatarAutocompleteSuggestionEntry,
): SearchType => {
  if ("Query" in suggestion) {
    return "avatar";
  } else {
    switch (suggestion.type) {
      case GamesAutocompleteSuggestionEntryType.QuerySuggestion: {
        return "keyword";
      }
      case GamesAutocompleteSuggestionEntryType.GameSuggestion: {
        return "game";
      }
      case GamesAutocompleteSuggestionEntryType.TrendingQuerySuggestion: {
        throw Error(`Unrecognized autocomplete suggestion, ${JSON.stringify(suggestion)}`);
      }
    }
  }
};

export const getDefaultSearchType = (suggestion: UniversalSearchLink): DefaultSearchType => {
  switch (suggestion.label) {
    case "Label.Players": {
      return "defaultPlayers";
    }
    case "Heading.Marketplace":
    case "Label.AvatarShop":
    case "Label.sCatalog": {
      return "defaultShops";
    }
    case "Label.sGroups": {
      return "defaultGroups";
    }
    case "Label.CreatorStore": {
      return "defaultLibrary";
    }
    case "Label.Games": {
      return "defaultGames";
    }
    default: {
      throw Error(`Unrecognized default suggestion, ${JSON.stringify(suggestion)}`);
    }
  }
};

export const getSuggestionUrl = (
  suggestion: Suggestion,
  event: KeyboardEvent<HTMLInputElement>,
) => {
  if ("Query" in suggestion) {
    return links.avatarSearchLink.url + encodeURIComponent(suggestion.Query);
  }
  if ("searchQuery" in suggestion) {
    return links.gameSearchLink.url + encodeURIComponent(suggestion.searchQuery);
  }
  if (event.currentTarget.value) {
    return suggestion.url + encodeURIComponent(event.currentTarget.value);
  }

  return "";
};

export const getAvatarAutocompleteLanguageCode = () => {
  let locale = new Intl().getLocale();
  const regionChar = locale.indexOf("-");
  locale = locale.substring(0, regionChar !== -1 ? regionChar : locale.length);
  if (locale !== searchConstants.englishLanguageCode) {
    locale += `,${searchConstants.englishLanguageCode}`;
  }
  return locale;
};

export const serializeSuggestions = (suggestions: readonly Suggestion[], searchInput: string) =>
  suggestions
    .map(suggestion => {
      if ("Query" in suggestion) {
        return `${getAutocompleteSearchType(suggestion)}|${suggestion.Query}`;
      }
      if ("searchQuery" in suggestion) {
        return `${getAutocompleteSearchType(suggestion)}|${suggestion.searchQuery}`;
      }
      return `${getDefaultSearchType(suggestion)}|${searchInput}`;
    })
    .join(",");
