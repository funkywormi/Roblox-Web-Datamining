import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { TextInput } from "@rbx/foundation-ui";
import { useUserSearch } from "../hooks/useUserSearch";
import {
  OmniSearchUser,
  USER_SEARCH_MAX_CHARACTERS,
  USER_SEARCH_MIN_CHARACTERS,
} from "../services/userSearchService";
import { OmniSearchResults } from "./OmniSearchResults";

type OmniSearchProps = {
  onSelectUser: (user: OmniSearchUser) => void;
};

/**
 * Encapsulates the username-search input and its results overlay, including
 * keyboard navigation, click-outside dismissal, and mount-time autofocus.
 *
 * The parent only needs to pass an onSelectUser callback - everything else
 * (search state, focus index, overlay gating) lives here so the host sheet
 * can stay focused on layout.
 */
export function OmniSearch({ onSelectUser }: OmniSearchProps) {
  const { translate } = useTranslation();
  const { searchText, setSearchText, users, isSearching, clearSearch } = useUserSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // preventScroll keeps iOS Safari from panning the layout viewport behind
  // the Liquid Glass keyboard, which would otherwise expose page content.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [users]);

  // Gate on the same min-character threshold that useUserSearch uses to fire
  // the API call. Otherwise 1-2 char inputs would mount the overlay over
  // whatever sits behind it before any search has run.
  const showOverlay =
    users.length > 0 || (!isSearching && searchText.trim().length >= USER_SEARCH_MIN_CHARACTERS);

  // Click outside the input + overlay group dismisses the dropdown so the
  // user can interact with content behind the absolute overlay.
  useEffect(() => {
    if (!showOverlay) return undefined;
    const handleClickOutside = (event: MouseEvent) => {
      const { target } = event;
      if (
        searchAreaRef.current &&
        target instanceof Node &&
        !searchAreaRef.current.contains(target)
      ) {
        clearSearch();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOverlay, clearSearch]);

  // Keyboard handling lives on the input (not the overlay) because the input
  // and overlay are DOM siblings - keystrokes from a focused input never
  // bubble to a sibling div's onKeyDown.
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showOverlay) {
      return;
    }
    if (users.length === 0) {
      if (e.key === "Escape") {
        e.preventDefault();
        clearSearch();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => (prev < users.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
      case "NumpadEnter": {
        e.preventDefault();
        const target = users[focusedIndex >= 0 ? focusedIndex : 0];
        if (target) onSelectUser(target);
        break;
      }
      case "Escape":
        e.preventDefault();
        clearSearch();
        break;
      default:
        break;
    }
  };

  const activeDescendantId =
    focusedIndex >= 0 && users[focusedIndex] ? `user-${users[focusedIndex].contentId}` : undefined;

  return (
    <div ref={searchAreaRef} className="relative">
      <TextInput
        ref={inputRef}
        size="Large"
        type="search"
        name="user-search"
        value={searchText}
        placeholder={translate("Label.SearchByUsername")}
        maxLength={USER_SEARCH_MAX_CHARACTERS}
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
        data-form-type="other"
        onChange={e => {
          // Usernames don't allow whitespace; strip any pasted/typed
          // spaces so the searched value matches what the API expects.
          setSearchText(e.target.value.replace(/\s+/g, ""));
        }}
        onKeyDown={handleSearchKeyDown}
        aria-autocomplete="list"
        aria-controls="user-search-listbox"
        aria-activedescendant={activeDescendantId}
        aria-label={translate("Label.SearchByUsername")}
      />
      {showOverlay && (
        <div className="absolute width-full" style={{ top: "calc(100% + 0.25rem)", zIndex: 10 }}>
          <OmniSearchResults
            users={users}
            isSearching={isSearching}
            searchText={searchText}
            focusedIndex={focusedIndex}
            onSelectUser={onSelectUser}
          />
        </div>
      )}
    </div>
  );
}
