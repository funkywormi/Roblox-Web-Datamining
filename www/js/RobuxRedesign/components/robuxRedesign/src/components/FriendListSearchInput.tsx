import { useTranslation } from "@rbx/core-scripts/react";
import { SearchInput } from "@rbx/foundation-ui";
import { USER_SEARCH_MAX_CHARACTERS } from "../services/userSearchService";

type FriendListSearchInputProps = {
  searchText: string;
  setSearchText: (text: string) => void;
  clearSearch: () => void;
};

const SEARCH_PLACEHOLDER_KEY = "Label.Search";

/**
 * Renders the controlled search input for the inline friend-list filter.
 */
export function FriendListSearchInput({
  searchText,
  setSearchText,
  clearSearch,
}: FriendListSearchInputProps) {
  const { translate } = useTranslation();
  const placeholder = translate(SEARCH_PLACEHOLDER_KEY);

  return (
    <SearchInput
      size="Medium"
      shape="Pill"
      // Scopes the idle-stroke and placeholder overrides in main.css. Passing
      // `label` instead of `aria-label` would add a visible label the design omits.
      className="send-robux-search-input"
      name="user-search"
      value={searchText}
      placeholder={placeholder}
      leadingIconName="icon-regular-magnifying-glass"
      maxLength={USER_SEARCH_MAX_CHARACTERS}
      autoComplete="off"
      // Usernames aren't dictionary words, and the desktop app's webview
      // otherwise offers a system autocorrect suggestion over the results.
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      data-1p-ignore
      data-lpignore="true"
      data-form-type="other"
      onChange={event => {
        // Usernames don't allow whitespace; strip any pasted/typed
        // spaces so the searched value matches what the API expects.
        setSearchText(event.target.value.replace(/\s+/g, ""));
      }}
      onKeyDown={event => {
        if (event.key === "Escape") {
          event.preventDefault();
          clearSearch();
        }
      }}
      aria-label={placeholder}
    />
  );
}
