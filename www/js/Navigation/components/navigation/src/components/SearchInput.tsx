import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  KeyboardEventHandler,
  FormEventHandler,
  ChangeEventHandler,
} from "react";
import classNames from "classnames";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import { useTranslation, useOnClickOutside } from "@rbx/core-scripts/react";
import { SearchLandingService } from "@rbx/core-scripts/legacy/Roblox";
import { PageNameProvider } from "@rbx/core-scripts/util/page-name";
import events from "../constants/searchEventStreamConstants";
import NewSearchLinks from "./NewSearchLinks";
import { Suggestion } from "../util/searchUtil";

export default function SearchInput({
  searchInput,
  isMenuOpen,
  handleSearchOpenOrInputChange,
  closeMenu,
  setIsMenuHover,
  indexOfSelectedOption,
  onSubmit,
  onKeyDown,
  onKeyUp,
  isUniverseSearchShown = true,
  searchSuggestions,
  autocompleteSessionInfo,
  resetSessionInfo,
}: {
  searchInput: string;
  isMenuOpen: boolean;
  handleSearchOpenOrInputChange: (input?: string) => void;
  closeMenu: () => void;
  setIsMenuHover: (open: boolean) => void;
  indexOfSelectedOption: number;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onKeyUp?: KeyboardEventHandler<HTMLInputElement>;
  isUniverseSearchShown?: boolean;
  searchSuggestions: readonly Suggestion[];
  autocompleteSessionInfo: string;
  resetSessionInfo: () => void;
}) {
  const { translate } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const searchLandingRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearchLandingEmpty, setIsSearchLandingEmpty] = useState(true);

  useEffect(() => {
    const onSetSearchLandingHasContent = () => {
      setIsSearchLandingEmpty(false);
    };
    // Sent from SearchLandingOmniFeed if there are recommendations to show
    // as we don't want the search overlay to show if there are no recommendations
    // and the user is just focused on the search input
    // Copied event name from Roblox.Games.WebApp/ts/react/searchLandingPage/service/modalConstants.ts
    window.addEventListener("SetSearchLandingHasContent", onSetSearchLandingHasContent);
    return () => {
      window.removeEventListener("SetSearchLandingHasContent", onSetSearchLandingHasContent);
    };
  }, []);

  const isClearingInputRef = useRef(false);
  const clearSearch = useCallback(() => {
    sendEvent(
      ...events.searchClear(
        searchInput,
        undefined,
        autocompleteSessionInfo,
        PageNameProvider.getInternalPageName(),
      ),
    );
    isClearingInputRef.current = true;
    inputRef.current?.focus();
    handleSearchOpenOrInputChange("");
  }, [autocompleteSessionInfo, handleSearchOpenOrInputChange, searchInput]);

  const onFocus = useCallback(() => {
    setIsFocused(true);
    // clearSearch already calls handleSearchOpenOrInputChange so skip the onFocus event
    if (isClearingInputRef.current) {
      isClearingInputRef.current = false;
      return;
    }
    handleSearchOpenOrInputChange();
  }, [handleSearchOpenOrInputChange]);

  const onBlur = () => {
    setIsFocused(false);
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      handleSearchOpenOrInputChange(e.target.value);
    },
    [handleSearchOpenOrInputChange],
  );

  const menuClassName = classNames(
    "navbar-left navbar-search col-xs-5 col-sm-6 col-md-2 col-lg-3",
    {
      "navbar-search-open": isMenuOpen && searchInput.length > 0,
      shown: isUniverseSearchShown,
    },
  );

  const searchLandingClassName = classNames("search-landing-root", {
    "search-landing-root-open": searchInput.length === 0 && isFocused,
  });

  // Only show the search overlay if the SLP has recommendations or autocomplete results are being shown
  const showOverlay =
    isFocused && ((!isSearchLandingEmpty && searchInput.length === 0) || searchInput.length > 0);
  const searchOverlayClassName = classNames("search-overlay", {
    "search-overlay-show": showOverlay,
  });

  // jpark 3/4/2022 Avatar Shop Autocomplete is fully enabled - this check can be removed when this IXP test code is cleaned up
  const showNewSearchLinks = true;

  useOnClickOutside<HTMLElement>([inputRef, dropdownRef, searchLandingRef], closeMenu);

  useEffect(() => {
    if (searchLandingRef.current) {
      SearchLandingService.mountSearchLanding();
    }
  }, [searchLandingRef]);

  return (
    <React.Fragment>
      <div data-testid="navigation-search-input" className={menuClassName} role="search">
        <div className="input-group">
          <form name="search-form" onSubmit={onSubmit} action="/search">
            <div className="form-has-feedback">
              <input
                ref={inputRef}
                id="navbar-search-input"
                type="search"
                name="search-bar"
                data-testid="navigation-search-input-field"
                className="form-control input-field new-input-field"
                value={searchInput}
                onChange={onChange}
                placeholder={translate("Label.sSearch")}
                maxLength={120}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              {searchInput.length > 0 && (
                <span
                  data-testid="navigation-search-input-clear-button"
                  tabIndex={0}
                  role="button"
                  aria-label="Clear Search"
                  onClick={clearSearch}
                  onKeyDown={clearSearch}
                  className="clear-search icon-actions-clear-sm"
                >
                  <span />
                </span>
              )}
            </div>
          </form>
          <div className="input-group-btn">
            {/* TODO: old, migrated code. */}
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <button
              data-testid="navigation-search-input-search-button"
              className="input-addon-btn"
              type="submit"
            >
              <span className="icon-common-search-sm" />
            </button>
          </div>
        </div>
        <ul
          ref={dropdownRef}
          className={classNames("dropdown-menu", {
            "new-dropdown-menu": showNewSearchLinks,
          })}
          role="menu"
          onMouseEnter={() => {
            setIsMenuHover(true);
          }}
          onMouseLeave={() => {
            setIsMenuHover(false);
          }}
        >
          <NewSearchLinks
            searchInput={searchInput}
            indexOfSelectedOption={indexOfSelectedOption}
            searchSuggestions={searchSuggestions}
            autocompleteSessionInfo={autocompleteSessionInfo}
            resetSessionInfo={resetSessionInfo}
          />
        </ul>
        <div
          ref={searchLandingRef}
          id="search-landing-root"
          data-testid="search-landing-root"
          className={searchLandingClassName}
        />
      </div>
      <div className={searchOverlayClassName} />
    </React.Fragment>
  );
}
