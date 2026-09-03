import React, { useCallback, useEffect, useState } from 'react';

/** Stable DOM id for the option at `index` within the listbox `listboxId`. */
export const getMemberOptionId = (listboxId: string, index: number): string =>
  `${listboxId}-option-${index}`;

export type UseMemberSuggestionsNavOptions = {
  listboxId: string;
  optionCount: number;
  // Whether the listbox is currently shown. Keys are ignored while closed so the input's
  // own Enter/Escape handling is unaffected.
  isOpen: boolean;
  onCommit: (index: number) => void;
};

export type UseMemberSuggestionsNavResult = {
  // -1 when no option is active, which is the state a freshly opened listbox starts in so
  // Enter still submits the typed text rather than silently picking the first row.
  activeIndex: number;
  resetActiveIndex: () => void;
  // Props to spread onto the text input driving the listbox.
  inputAriaProps: {
    role: 'combobox';
    'aria-expanded': boolean;
    'aria-controls': string;
    'aria-autocomplete': 'list';
    'aria-activedescendant': string | undefined;
  };
  /**
   * Handle a keydown for the listbox. Returns true when the key was consumed, so the caller
   * can fall through to its own behaviour otherwise — Enter on an active option selects that
   * member, Enter with no active option submits the search.
   */
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => boolean;
};

/**
 * Keyboard navigation and ARIA 1.2 combobox wiring for a member-suggestions listbox.
 *
 * Foundation UI's Autocomplete is the wrong shape for a search box: it is a value picker that
 * matches against the whole input rather than an @token inside it, always renders a trailing
 * chevron, and fixes option content to a title/description pair, so the roving-focus behaviour
 * lives here and can be reused by any @-mention control.
 */
function useMemberSuggestionsNav({
  listboxId,
  optionCount,
  isOpen,
  onCommit
}: UseMemberSuggestionsNavOptions): UseMemberSuggestionsNavResult {
  const [activeIndex, setActiveIndex] = useState(-1);

  const resetActiveIndex = useCallback(() => setActiveIndex(-1), []);

  // Drop the active option when the listbox closes, and whenever the result set shrank past
  // it, so aria-activedescendant can never point at an option that is no longer rendered.
  useEffect(() => {
    if (!isOpen || activeIndex >= optionCount) {
      setActiveIndex(-1);
    }
  }, [isOpen, activeIndex, optionCount]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): boolean => {
      if (!isOpen || optionCount === 0) return false;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex(current => (current + 1) % optionCount);
        return true;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex(current => (current <= 0 ? optionCount - 1 : current - 1));
        return true;
      }
      if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault();
        onCommit(activeIndex);
        return true;
      }
      return false;
    },
    [isOpen, optionCount, activeIndex, onCommit]
  );

  return {
    activeIndex,
    resetActiveIndex,
    inputAriaProps: {
      role: 'combobox',
      'aria-expanded': isOpen,
      'aria-controls': listboxId,
      'aria-autocomplete': 'list',
      'aria-activedescendant':
        isOpen && activeIndex >= 0 ? getMemberOptionId(listboxId, activeIndex) : undefined
    },
    handleKeyDown
  };
}

export default useMemberSuggestionsNav;
