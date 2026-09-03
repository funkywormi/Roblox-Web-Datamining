import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  KeyboardEventHandler,
  FormEventHandler,
} from "react";
import { usePrevious, useDebounce, useTranslation } from "@rbx/core-scripts/react";
import { UrlSearchParams } from "@rbx/core-lib/url";
import * as http from "@rbx/core-scripts/http";
import { PageNameProvider } from "@rbx/core-scripts/util/page-name";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import { removeUrlLocale } from "@rbx/core-scripts/endpoints";
import { SearchLandingService } from "@rbx/core-scripts/legacy/Roblox";
import SearchInput from "../components/SearchInput";
import layout from "../constants/layoutConstants";
import linkConstants from "../constants/linkConstants";
import search from "../constants/searchConstants";
import {
  GamesAutocompleteSuggestionEntryType,
  TAvatarAutocompleteSuggestionEntry,
  TGamesAutocompleteSuggestionEntry,
  getAvatarRequestSuggestion,
  getSearchSuggestion,
} from "../services/searchService";
import events from "../constants/searchEventStreamConstants";
import {
  getNewUniversalSearchLinks,
  getAvatarAutocompleteSearchLinks,
} from "../util/navigationUtil";
import {
  getAutocompleteSearchType,
  getAvatarAutocompleteLanguageCode,
  getDefaultSearchType,
  getSuggestionUrl,
  serializeSuggestions,
} from "../util/searchUtil";

export default function UniversalSearch({
  isUniverseSearchShown = true,
}: {
  isUniverseSearchShown?: boolean;
}) {
  const { translate } = useTranslation();
  const [searchInput, setSearchInput] = useState(
    UrlSearchParams.parse(window.location.search).get("keyword") ?? "",
  );

  const debouncedSearchInput = useDebounce(searchInput, search.debounceTimeout);
  const previousDebouncedSearchInput = usePrevious(debouncedSearchInput);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    TAvatarAutocompleteSuggestionEntry[] | TGamesAutocompleteSuggestionEntry[] | null
  >(null);
  const [autocompleteSessionInfo, setAutocompleteSessionInfo] = useState(
    events.generateSessionInfo(),
  );
  const [searchLandingPageSessionInfo, setSearchLandingPageSessionInfo] = useState(
    events.generateSessionInfo(),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInitialCall, setIsInitialCall] = useState(true);
  const [isMenuHover, setIsMenuHover] = useState(false);
  const [indexOfSelectedOption, setSelectedListOptions] = useState(0);
  const [useAvatarAutocompletFallbackUrl, setUseAvatarAutocompletFallbackUrl] = useState(false);
  const { keyCodes } = layout;

  const [universalSearchLinks, setUniversalSearchLinks] = useState(getNewUniversalSearchLinks());
  const gameSearchLinkIndex = universalSearchLinks.findIndex(
    ({ label }) => label === linkConstants.gameSearchLink.label,
  );
  const avatarShopSearchLinkIndex = getNewUniversalSearchLinks().findIndex(
    ({ label }) => label === linkConstants.avatarSearchLink.label,
  );
  const userLanguageCode = getAvatarAutocompleteLanguageCode();

  const showAvatarAutocompleteSuggestions = getAvatarAutocompleteSearchLinks();
  const constructSearchSuggestions = (
    additionalSuggestions:
      | readonly TGamesAutocompleteSuggestionEntry[]
      | readonly TAvatarAutocompleteSuggestionEntry[]
      | null,
  ) => {
    if (additionalSuggestions == null) {
      return universalSearchLinks;
    }
    if (showAvatarAutocompleteSuggestions) {
      const avatarSplicedSuggestions = additionalSuggestions.filter(
        suggestion =>
          "Query" in suggestion || suggestion.searchQuery !== debouncedSearchInput.toLowerCase(),
      );
      return [
        ...universalSearchLinks.slice(0, avatarShopSearchLinkIndex + 1),
        ...avatarSplicedSuggestions,
        ...universalSearchLinks.slice(avatarShopSearchLinkIndex + 1),
      ];
    }
    if (search.isSpecialTreatmentAutocompleteRestricted()) {
      return universalSearchLinks;
    }
    const showGameSearchLink =
      additionalSuggestions.findIndex(
        suggestion =>
          "searchQuery" in suggestion &&
          suggestion.searchQuery === debouncedSearchInput.toLowerCase() &&
          suggestion.type === GamesAutocompleteSuggestionEntryType.GameSuggestion,
      ) === -1;
    const splicedSuggestions = additionalSuggestions
      .filter(
        suggestion =>
          ("searchQuery" in suggestion &&
            suggestion.searchQuery !== debouncedSearchInput.toLowerCase()) ||
          ("type" in suggestion &&
            suggestion.type === GamesAutocompleteSuggestionEntryType.GameSuggestion),
      )
      .slice(0, 3);

    return [
      ...universalSearchLinks.slice(
        0,
        showGameSearchLink ? gameSearchLinkIndex + 1 : gameSearchLinkIndex,
      ),
      ...splicedSuggestions,
      ...universalSearchLinks.slice(gameSearchLinkIndex + 1),
    ];
  };

  const searchSuggestions = useMemo(
    () => constructSearchSuggestions(autocompleteSuggestions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [autocompleteSuggestions, universalSearchLinks],
  );

  const processAvatarShopAutocompleteSuggestions = (
    avatarShopSuggestions: readonly TAvatarAutocompleteSuggestionEntry[],
    query: string,
  ) => {
    let suggestionCount = 0;
    const cleanedSuggestions: TAvatarAutocompleteSuggestionEntry[] = [];
    avatarShopSuggestions.forEach(suggestion => {
      if (
        suggestionCount < search.avatarAutocompleteSuggestionLimit &&
        suggestion.Query !== query
      ) {
        cleanedSuggestions.push(suggestion);
        suggestionCount += 1;
      }
    });

    return cleanedSuggestions;
  };

  const searchSuggestionLength = searchSuggestions.length;
  useEffect(() => {
    // prevents sending a search event when the component is just being mounted
    if (!isInitialCall) {
      sendEvent(
        ...events.search(
          searchInput,
          events.contexts.searchAutocomplete,
          events.actionTypes.submit,
          autocompleteSessionInfo,
        ),
      );
    }
    setIsInitialCall(false);

    const getAutocompleteSuggestion = async () => {
      if (
        debouncedSearchInput !== "" &&
        debouncedSearchInput.length <= search.debouncedSearchInputMaxLength
      ) {
        setAutocompleteSuggestions(null);
        const start = Date.now();

        if (showAvatarAutocompleteSuggestions) {
          try {
            const end = Date.now();
            const data = await getAvatarRequestSuggestion(
              debouncedSearchInput,
              userLanguageCode,
              search.avatarAutocompleteQueryPaddingAmount,
              previousDebouncedSearchInput ?? "",
              useAvatarAutocompletFallbackUrl,
            );
            const constructedSuggestions = processAvatarShopAutocompleteSuggestions(
              data.Data,
              debouncedSearchInput,
            );
            sendEvent(
              ...events.searchAutocomplete(
                debouncedSearchInput,
                previousDebouncedSearchInput,
                false,
                serializeSuggestions(constructedSuggestions, debouncedSearchInput),
                data.Args.Algo,
                end - start,
                search.debounceTimeout,
                "",
                PageNameProvider.getInternalPageName(),
                previousDebouncedSearchInput !== "",
              ),
            );
            setAutocompleteSuggestions(constructedSuggestions);
          } catch (error) {
            if (!http.isCancelled(error)) {
              setAutocompleteSuggestions([]);
            }
            setUseAvatarAutocompletFallbackUrl(true);
          }
        } else {
          try {
            const data = await getSearchSuggestion(debouncedSearchInput);
            const end = Date.now();
            const seenSuggestions = constructSearchSuggestions(data.entries);
            sendEvent(
              ...events.searchAutocomplete(
                debouncedSearchInput,
                previousDebouncedSearchInput,
                false,
                serializeSuggestions(seenSuggestions, debouncedSearchInput),
                data.algorithmName,
                end - start,
                search.debounceTimeout,
                autocompleteSessionInfo,
                PageNameProvider.getInternalPageName(),
                false,
              ),
            );
            setAutocompleteSuggestions(data.entries);
          } catch (error) {
            if (!http.isCancelled(error)) {
              setAutocompleteSuggestions([]);
            }
          }
        }
      }
    };

    if (showAvatarAutocompleteSuggestions) {
      setUniversalSearchLinks(getNewUniversalSearchLinks());
    }

    getAutocompleteSuggestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchInput]);

  const resetAutocompleteSessionInfo = () => {
    setAutocompleteSessionInfo(events.generateSessionInfo());
  };

  const resetSearchLandingPageSessionInfo = () => {
    const newSearchLandingSessionInfo = events.generateSessionInfo();
    setSearchLandingPageSessionInfo(newSearchLandingSessionInfo);
    SearchLandingService.updateSessionInfo(newSearchLandingSessionInfo);
  };

  const resetSessionInfo = () => {
    resetAutocompleteSessionInfo();
    resetSearchLandingPageSessionInfo();
  };

  const showSearchLandingPage = useCallback(() => {
    const newSearchLandingSessionInfo = events.generateSessionInfo();
    SearchLandingService.showSearchLanding(newSearchLandingSessionInfo);
    sendEvent(
      ...events.search(
        undefined,
        events.contexts.searchLandingPage,
        events.actionTypes.open,
        undefined,
        newSearchLandingSessionInfo,
      ),
    );
    setSearchLandingPageSessionInfo(newSearchLandingSessionInfo);
  }, []);

  // If the search input is not provided, its a search open from clicking the search bar
  // not from a user typing or hitting clear search ("")
  const handleSearchOpenOrInputChange = useCallback(
    (newSearchInput: string = searchInput) => {
      setSearchInput(newSearchInput);

      // If the search input is trimmed, send a search text trim event
      if (newSearchInput.length < searchInput.length) {
        sendEvent(
          ...events.searchTextTrim(searchInput, newSearchInput, undefined, autocompleteSessionInfo),
        );
      }

      if (newSearchInput.length === 0) {
        // If search input is empty, show the SLP
        showSearchLandingPage();
        // Log a new autocomplete session anytime the search input is empty
        const newAutocompleteSessionInfo = events.generateSessionInfo();
        sendEvent(
          ...events.search(
            newSearchInput,
            events.contexts.searchAutocomplete,
            events.actionTypes.open,
            newAutocompleteSessionInfo,
          ),
        );
        setAutocompleteSessionInfo(newAutocompleteSessionInfo);
        // Reset any previously selected autocomplete suggestions
        setSelectedListOptions(0);
      }

      if (isMenuHover) return;

      // SLP menu will be shown for empty input and autocomplete menu shown for non-empty input
      setIsMenuOpen(true);
    },
    [autocompleteSessionInfo, showSearchLandingPage, isMenuHover, searchInput],
  );

  const closeMenu = () => {
    if (!isMenuOpen) {
      return;
    }

    if (searchInput.length === 0) {
      sendEvent(
        ...events.search(
          null,
          events.contexts.searchLandingPage,
          events.actionTypes.cancel,
          undefined,
          searchLandingPageSessionInfo,
        ),
      );
    } else {
      sendEvent(
        ...events.search(
          searchInput,
          events.contexts.searchAutocomplete,
          events.actionTypes.close,
          autocompleteSessionInfo,
        ),
      );
    }

    setIsMenuOpen(false);
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onKeyDown: KeyboardEventHandler = e => {
    let currentCursor = indexOfSelectedOption;
    if (
      isMenuOpen &&
      (e.keyCode === keyCodes.arrowUp ||
        e.keyCode === keyCodes.arrowDown ||
        e.keyCode === keyCodes.tab)
    ) {
      e.stopPropagation();
      e.preventDefault();

      if (e.keyCode === keyCodes.arrowUp) {
        currentCursor -= 1;
      } else {
        currentCursor += 1;
      }

      currentCursor %= searchSuggestionLength;
      if (currentCursor < 0) {
        currentCursor = searchSuggestionLength + currentCursor;
      }
      setSelectedListOptions(currentCursor);
    }
  };

  const onKeyUp: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.keyCode === keyCodes.enter) {
      e.stopPropagation();
      e.preventDefault();
      // Prevent form submits on enter when SLP is visible / nothing is typed
      if (searchInput.length === 0) return;

      const suggestion = searchSuggestions[indexOfSelectedOption];
      if (suggestion == null) return;

      if ("searchQuery" in suggestion) {
        sendEvent(
          ...events.searchSuggestionClicked(
            debouncedSearchInput,
            undefined,
            indexOfSelectedOption,
            suggestion.searchQuery,
            getAutocompleteSearchType(suggestion),
            serializeSuggestions(searchSuggestions, searchInput),
            autocompleteSessionInfo,
          ),
        );
        sendEvent(...events.catalogSearch(1, PageNameProvider.getInternalPageName()));
      } else if ("label" in suggestion) {
        sendEvent(
          ...events.searchSuggestionClicked(
            debouncedSearchInput,
            undefined,
            indexOfSelectedOption,
            debouncedSearchInput,
            getDefaultSearchType(suggestion),
            serializeSuggestions(searchSuggestions, searchInput),
            autocompleteSessionInfo,
          ),
        );
        sendEvent(...events.catalogSearch(0, PageNameProvider.getInternalPageName()));
      }
      resetAutocompleteSessionInfo();
      const suggestionUrl = getSuggestionUrl(suggestion, e);
      if (suggestionUrl) {
        let redirectUrl = suggestionUrl;
        if ("label" in suggestion && suggestion.label === "Label.CreatorStore") {
          if (e.currentTarget.value) {
            redirectUrl += encodeURIComponent(e.currentTarget.value);
          }
        }

        if (document.getElementById("routing")) {
          const url = new URL(redirectUrl);
          if (
            url.origin === window.location.origin &&
            removeUrlLocale(url.pathname).toLowerCase() === "/catalog"
          ) {
            const customEvent = new CustomEvent("externalNavigation", {
              detail: { url: redirectUrl },
            });
            window.dispatchEvent(customEvent);
            // close auto completes and unfocus the input
            setIsMenuOpen(false);
            document.getElementById("navbar-search-input")?.blur();
            return;
          }
        }

        window.location.href = redirectUrl;
      }
    }
  };

  const setSearchMenuClose = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    window.addEventListener("setSearchMenuClose", setSearchMenuClose);
    return () => {
      window.removeEventListener("setSearchMenuClose", setSearchMenuClose);
    };
  }, [isMenuOpen]);

  return (
    <SearchInput
      {...{
        searchInput,
        handleSearchOpenOrInputChange,
        closeMenu,
        setIsMenuHover,
        isMenuOpen,
        indexOfSelectedOption,
        onSubmit,
        onKeyDown,
        onKeyUp,
        isUniverseSearchShown,
        translate,
        searchSuggestions,
        autocompleteSessionInfo,
        resetSessionInfo,
      }}
    />
  );
}
