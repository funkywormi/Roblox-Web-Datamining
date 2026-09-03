import React, { useState, useCallback, useEffect } from 'react';
import { Intl } from 'Roblox';
import { AutocompleteSuggestions, Category, Library, Subcategory } from '../../constants/types';
import CatalogAPIService from '../../services/catalogAPIService';
import { CatalogQuery } from '../../hooks/catalogQuery/catalogQuery.types';
import catalogConstants from '../../constants/catalogConstants';
import SearchBar from './SearchBar';
import { EventServiceDefault } from '../../services/eventService';

const intl = new Intl();

export type WrappedSearchBarProps = {
  keywordForDisplay: string;
  setKeywordForDisplay: (keyword: string) => void;
  search: (keyword: string) => void;
  catalogQuery: CatalogQuery;
  categories?: Category[];
  hasSearchOptionsError?: boolean;
  autocompleteAvatarSearchNumToDisplay: number | undefined;
  library: Library;
  updateCategory: (
    event: React.MouseEvent,
    clearFilters: boolean,
    shouldClearKeyword: boolean,
    newCategory: Category,
    newSubcategory: Subcategory | undefined
  ) => void;
  buyRobuxButtonOnClick: () => void;
  buyRobuxButtonUrl: string;
  getCategoryDropdownValue: () => string;
  isSearchOnBlurEnabled: boolean;
  searchBarOnly?: boolean;
};

export function WrappedSearchBar(props: WrappedSearchBarProps): JSX.Element {
  const {
    keywordForDisplay,
    setKeywordForDisplay,
    search,
    catalogQuery,
    categories,
    hasSearchOptionsError,
    autocompleteAvatarSearchNumToDisplay,
    library,
    updateCategory,
    buyRobuxButtonOnClick,
    buyRobuxButtonUrl,
    getCategoryDropdownValue,
    isSearchOnBlurEnabled,
    searchBarOnly
  } = props;

  const [autocompleteLanguageCode, setAutocompleteLanguageCode] = useState<string>();
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompleteSuggestions>({
    show: false,
    timeSinceLastSearchAutocompleteEvent: 0,
    suggestions: [],
    textSuggestions: [],
    previousQuery: '',
    previousQueryBeforeRemoval: '',
    previousCharInput: -1,
    backspaceInput: false,
    startTime: 0,
    keyboardPosition: -1,
    locale: ''
  });
  const [useAutocompleteFallback, setUseAutocompleteFallback] = useState<boolean>();

  const getUserLocale = () => {
    let { locale } = intl;
    setAutocompleteSuggestions(prevState => ({ ...prevState, locale }));
    const regionChar = locale.indexOf('-');
    locale = locale.substring(0, regionChar !== -1 ? regionChar : locale.length);
    if (locale !== catalogConstants.englishLanguageCode) {
      locale += `,${catalogConstants.englishLanguageCode}`;
    }
    setAutocompleteLanguageCode(locale);
  };

  useEffect(() => {
    getUserLocale();
  }, []);

  const onKeywordKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace key
    if (event.key === 'Backspace') {
      setAutocompleteSuggestions(prevState => ({
        ...prevState,
        previousQueryBeforeRemoval: catalogQuery.keyword,
        backspaceInput: true,
        previousCharInput: event.which
      }));
    }
    // Navigate down or handle tab key without shifting focus
    else if (event.key === 'ArrowDown' || event.key === 'Tab') {
      const newPosition = autocompleteSuggestions.keyboardPosition + 1;
      const newSuggestion = document.querySelector(`#autocomplete-suggestion-li-${newPosition}`);
      if (newPosition < autocompleteSuggestions.suggestions.length) {
        event.stopPropagation();
        event.preventDefault();
        const previousSuggestion = document.querySelector(
          `#autocomplete-suggestion-li-${autocompleteSuggestions.keyboardPosition}`
        );
        previousSuggestion?.classList.remove('selected');
        setAutocompleteSuggestions(prevState => ({
          ...prevState,
          keyboardPosition: newPosition,
          previousCharInput: event.which
        }));
        newSuggestion?.classList.add('selected');
      } else if (event.key === 'ArrowDown') {
        event.stopPropagation();
        event.preventDefault();
        setAutocompleteSuggestions(prevState => ({ ...prevState, previousCharInput: event.which }));
      } else {
        document
          .querySelector(
            `#autocomplete-suggestion-li-${autocompleteSuggestions.suggestions.length - 1}`
          )
          ?.classList.remove('selected');
        setAutocompleteSuggestions(prevState => ({
          ...prevState,
          show: false,
          keyboardPosition: -1,
          previousCharInput: event.which
        }));
      }
    }
    // Navigate up in suggestions
    else if (event.key === 'ArrowUp') {
      event.stopPropagation();
      event.preventDefault();
      const previousSuggestion = document.querySelector(
        `#autocomplete-suggestion-li-${autocompleteSuggestions.keyboardPosition}`
      );
      previousSuggestion?.classList.remove('selected');
      const newPosition = autocompleteSuggestions.keyboardPosition - 1;
      const newSuggestion = document.querySelector(`#autocomplete-suggestion-li-${newPosition}`);
      if (newPosition > -1) {
        setAutocompleteSuggestions(prevState => ({
          ...prevState,
          keyboardPosition: newPosition,
          previousCharInput: event.which
        }));
        newSuggestion?.classList.add('selected');
      } else {
        setAutocompleteSuggestions(prevState => ({
          ...prevState,
          keyboardPosition: -1
        }));
      }
    } else if (event.key === 'Enter') {
      if (autocompleteSuggestions.keyboardPosition === -1) {
        (event.target as HTMLInputElement).blur();
        search(keywordForDisplay);

        setAutocompleteSuggestions(prevState => ({ ...prevState, show: false }));
        EventServiceDefault.sendCatalogSearchEvent(0);
      } else {
        setTimeout(() => {
          const suggestionElement = document.querySelector(
            `#autocomplete-suggestion-${autocompleteSuggestions.keyboardPosition}`
          );
          if (suggestionElement && suggestionElement instanceof HTMLElement) {
            suggestionElement.click();
          }
        }, 0);
      }
    }
    // Handle other key presses
    else {
      setAutocompleteSuggestions(prevState => ({
        ...prevState,
        previousCharInput: event.which
      }));
    }
  };

  const getAutocompleteSuggestions = useCallback(
    (searchTerm: string) => {
      const startTime = Date.now();
      CatalogAPIService.getAvatarRequestSuggestion(
        searchTerm,
        autocompleteLanguageCode,
        catalogConstants.autocompleteQueryAmount,
        autocompleteSuggestions.previousQuery,
        useAutocompleteFallback
      ).then(
        function success(result) {
          const autocompleteSuggestionsResponse = result.data;

          // Ignore outdated responses
          if (autocompleteSuggestionsResponse.Args.Prefix !== keywordForDisplay) {
            return;
          }

          setAutocompleteSuggestions(prevAutocompleteSuggestions => {
            const updatedAutocompleteSuggestions = {
              ...prevAutocompleteSuggestions
            };

            updatedAutocompleteSuggestions.suggestions = [];
            updatedAutocompleteSuggestions.textSuggestions = [];
            let avatarRequestSuggestionData = autocompleteSuggestionsResponse.Data;
            avatarRequestSuggestionData = avatarRequestSuggestionData.slice(
              0,
              autocompleteAvatarSearchNumToDisplay
            );
            avatarRequestSuggestionData.forEach(suggestion => {
              updatedAutocompleteSuggestions.suggestions.push(suggestion);
              updatedAutocompleteSuggestions.textSuggestions.push(suggestion.Query);
            });

            if (
              Date.now() >
                updatedAutocompleteSuggestions.timeSinceLastSearchAutocompleteEvent +
                  catalogConstants.autocompleteSuggestionEventData
                    .autocompleteSuggestionEventTimeoutDelay ||
              updatedAutocompleteSuggestions.timeSinceLastSearchAutocompleteEvent === null
            ) {
              updatedAutocompleteSuggestions.previousQuery =
                autocompleteSuggestionsResponse.Args.Prefix;
              EventServiceDefault.sendSearchAutocompleteEvent(
                autocompleteSuggestionsResponse.Args.Algo,
                updatedAutocompleteSuggestions.textSuggestions,
                autocompleteSuggestionsResponse.Args.Prefix,
                updatedAutocompleteSuggestions.previousQuery,
                updatedAutocompleteSuggestions.locale,
                Date.now() - startTime,
                autocompleteAvatarSearchNumToDisplay,
                autocompleteSuggestions.previousQuery !== ''
              );
            }
            if (updatedAutocompleteSuggestions.backspaceInput === true) {
              EventServiceDefault.sendSearchTextTrimEvent(
                updatedAutocompleteSuggestions.previousQueryBeforeRemoval,
                autocompleteSuggestionsResponse.Args.Prefix
              );
            }
            updatedAutocompleteSuggestions.timeSinceLastSearchAutocompleteEvent = Date.now();
            updatedAutocompleteSuggestions.backspaceInput = false;

            return updatedAutocompleteSuggestions;
          });
        },
        function error() {
          setUseAutocompleteFallback(true);
        }
      );
    },
    [
      autocompleteAvatarSearchNumToDisplay,
      autocompleteLanguageCode,
      autocompleteSuggestions.previousQuery,
      keywordForDisplay,
      useAutocompleteFallback
    ]
  );

  const onKeywordInputClicked = (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    event.stopPropagation();
    setAutocompleteSuggestions(prevState => ({
      ...prevState,
      show: true
    }));
  };

  const onClickOutsideAutocomplete = () => {
    setAutocompleteSuggestions(prevState => ({
      ...prevState,
      show: false,
      keyboardPosition: -1
    }));
  };

  const onAutocompleteSuggestionClicked = (suggestion: string, index: number) => {
    search(suggestion);

    getAutocompleteSuggestions(suggestion);

    EventServiceDefault.sendSearchSuggestionClickedEvent(
      keywordForDisplay,
      index,
      suggestion,
      autocompleteSuggestions.textSuggestions
    );
    EventServiceDefault.sendCatalogSearchEvent(1);

    setAutocompleteSuggestions(prevState => ({ ...prevState, show: false, keyboardPosition: -1 }));
  };

  const onKeywordClear = (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    EventServiceDefault.sendSearchClearEvent(keywordForDisplay);
    document.getElementById('avatar-shop-keyword-input')?.focus();
    search('');
    setAutocompleteSuggestions(prevState => ({
      ...prevState,
      show: false,
      suggestions: [],
      textSuggestions: []
    }));
  };

  useEffect(() => {
    if (keywordForDisplay) {
      getAutocompleteSuggestions(keywordForDisplay);
    } else {
      setAutocompleteSuggestions(prevState => ({
        ...prevState,
        suggestions: [],
        textSuggestions: []
      }));
    }
  }, [getAutocompleteSuggestions, keywordForDisplay]);

  return (
    <SearchBar
      searchInputValue={keywordForDisplay}
      setSearchInputValue={setKeywordForDisplay}
      search={search}
      autocompleteSuggestions={autocompleteSuggestions}
      categories={categories}
      hasSearchOptionsError={hasSearchOptionsError}
      library={library}
      onClickOutsideAutocomplete={onClickOutsideAutocomplete}
      onKeywordKeydown={onKeywordKeydown}
      onKeywordInputClicked={onKeywordInputClicked}
      onKeywordClear={onKeywordClear}
      onAutocompleteSuggestionClicked={onAutocompleteSuggestionClicked}
      updateCategory={updateCategory}
      buyRobuxButtonOnClick={buyRobuxButtonOnClick}
      buyRobuxButtonUrl={buyRobuxButtonUrl}
      getCategoryDropdownValue={getCategoryDropdownValue}
      isSearchOnBlurEnabled={isSearchOnBlurEnabled}
      searchBarOnly={searchBarOnly}
    />
  );
}
