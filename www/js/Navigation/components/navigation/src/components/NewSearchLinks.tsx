import React from "react";
import { PageNameProvider } from "@rbx/core-scripts/util/page-name";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import {
  getAutocompleteSearchType,
  getDefaultSearchType,
  serializeSuggestions,
  Suggestion,
  DefaultSearchType,
  SearchType,
} from "../util/searchUtil";
import { AutocompleteSearchLink, AvatarAutocompleteSearchLink, SearchLink } from "./SearchLink";
import events from "../constants/searchEventStreamConstants";

export default function NewSearchLinks({
  searchInput,
  indexOfSelectedOption,
  searchSuggestions,
  autocompleteSessionInfo,
  resetSessionInfo,
}: {
  searchInput: string;
  indexOfSelectedOption: number;
  searchSuggestions: readonly Suggestion[];
  autocompleteSessionInfo: string;
  resetSessionInfo: () => void;
}) {
  const onClick =
    (suggestionType: SearchType | DefaultSearchType, suggestion: Suggestion, index: number) =>
    () => {
      sendEvent(
        ...events.searchSuggestionClicked(
          searchInput,
          undefined,
          index,
          "searchQuery" in suggestion ? suggestion.searchQuery : searchInput,
          suggestionType,
          serializeSuggestions(searchSuggestions, searchInput),
          autocompleteSessionInfo,
        ),
      );
      resetSessionInfo();

      const isAutocomplete = suggestionType.includes("default") ? 0 : 1;
      sendEvent(...events.catalogSearch(isAutocomplete, PageNameProvider.getInternalPageName()));
    };
  return (
    <React.Fragment>
      {searchSuggestions.map((suggestion, index) => {
        const selected = index === indexOfSelectedOption;
        if ("Query" in suggestion) {
          return (
            <AvatarAutocompleteSearchLink
              key={suggestion.Query}
              selected={selected}
              suggestion={suggestion}
              onClick={onClick(getAutocompleteSearchType(suggestion), suggestion, index)}
            />
          );
        }
        if ("searchQuery" in suggestion) {
          return (
            <AutocompleteSearchLink
              key={suggestion.searchQuery}
              selected={selected}
              suggestion={suggestion}
              onClick={onClick(getAutocompleteSearchType(suggestion), suggestion, index)}
            />
          );
        }
        return (
          <SearchLink
            key={suggestion.url}
            selected={selected}
            suggestion={suggestion}
            searchInput={searchInput}
            onClick={onClick(getDefaultSearchType(suggestion), suggestion, index)}
          />
        );
      })}
    </React.Fragment>
  );
}
