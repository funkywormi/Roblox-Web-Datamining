import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconButton, TextInput } from '@rbx/foundation-ui';
import { useOnClickOutside, useTranslation } from 'react-utilities';
import MemberSuggestionsDropdown from '../../shared/components/MemberSuggestionsDropdown';
import useMemberSearch from '../../shared/hooks/useMemberSearch';
import useMemberSuggestionsNav from '../../shared/hooks/useMemberSuggestionsNav';
import { User } from '../../shared/types';
import ForumsSearchFilters from './ForumsSearchFilters';
import { useForumsSearchContext } from '../contexts/ForumsSearchContext';
import { ContentType, ForumsMode, TimeRange } from '../types/search';
import { MEMBER_PREFIX, parseMemberQuery } from '../utils/forumsSearchUrl';
import { logGroupForumsClickEvent, logGroupPageExposureEvent } from '../../shared/utils/logging';
import { EventContext, EventType } from '../../shared/constants/eventConstants';

// One search bar per page, so a module-constant id is enough to wire the input to its listbox.
const MEMBER_SUGGESTIONS_LISTBOX_ID = 'group-forums-member-suggestions';

/**
 * The expanded search bar: text input plus the @member suggestions listbox.
 *
 * Mounted only while expanded, so neither the member lookup nor the click-outside listener
 * exists while the bar is collapsed.
 */
const ForumsSearchBar = ({ onCollapse }: { onCollapse: () => void }): JSX.Element => {
  const { translate } = useTranslation();
  const { groupId, canViewMembers, urlState, submitSearch } = useForumsSearchContext();

  // The only transient piece of search state. Kept local so a keystroke re-renders this bar and
  // nothing else — the provider hears about a search only once it is committed to the URL.
  const [draft, setDraft] = useState(urlState.query);
  // Set when the user dismisses the listbox (Escape, or a click outside) so it stays shut until
  // they type again. Visibility is derived from this rather than held as its own state.
  const [isDismissed, setIsDismissed] = useState(false);

  // An external change to the committed query — submit, category nav, browser back/forward —
  // reflects back into the visible text.
  useEffect(() => {
    setDraft(urlState.query);
  }, [urlState.query]);

  const memberQuery = useMemo(() => (canViewMembers ? parseMemberQuery(draft) : null), [
    canViewMembers,
    draft
  ]);
  // An @token with no terminating space yet. Suggestions stay open for the whole of it —
  // including the bare "@" — so the loading / prompt / empty / error states surface.
  const isTypingMemberToken = !!memberQuery && !memberQuery.isComplete;
  const memberPrefix = memberQuery && !memberQuery.isComplete ? memberQuery.username : '';
  const isSuggestionsOpen = isTypingMemberToken && !isDismissed;

  const { members, status } = useMemberSearch(groupId, memberPrefix, {
    enabled: canViewMembers && isTypingMemberToken
  });

  const selectMember = useCallback(
    (member: User) => {
      // Committing the canonical `@username ` keeps the URL's author resolution unambiguous.
      const next = `${MEMBER_PREFIX}${member.username} `;
      setDraft(next);
      setIsDismissed(true);
      submitSearch(next);
      logGroupForumsClickEvent({ groupId, clickTargetType: 'selectMemberSuggestion' });
    },
    [submitSearch, groupId]
  );

  const commitActiveOption = useCallback(
    (index: number) => {
      const member = members[index];
      if (member) selectMember(member);
    },
    [members, selectMember]
  );

  const { activeIndex, resetActiveIndex, inputAriaProps, handleKeyDown } = useMemberSuggestionsNav({
    listboxId: MEMBER_SUGGESTIONS_LISTBOX_ID,
    optionCount: members.length,
    isOpen: isSuggestionsOpen,
    onCommit: commitActiveOption
  });

  // Wraps the input as well as the listbox, so clicking into the text to move the cursor does
  // not count as clicking away.
  const searchBarRef = useRef<HTMLDivElement>(null);
  const outsideClickRefs = useMemo(() => [searchBarRef], []);
  useOnClickOutside(
    outsideClickRefs,
    useCallback(() => setIsDismissed(true), [])
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDraft(event.target.value);
      // Typing reopens a dismissed listbox and invalidates any highlighted option.
      setIsDismissed(false);
      resetActiveIndex();
    },
    [resetActiveIndex]
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Arrow keys, and Enter on a highlighted member, belong to the listbox.
      if (handleKeyDown(event)) return;

      if (event.key === 'Enter') {
        setIsDismissed(true);
        submitSearch(draft);
        return;
      }
      if (event.key === 'Escape') {
        // Escape closes the listbox first; a second Escape closes the whole bar.
        if (isSuggestionsOpen) setIsDismissed(true);
        else onCollapse();
      }
    },
    [handleKeyDown, submitSearch, draft, isSuggestionsOpen, onCollapse]
  );

  return (
    <div ref={searchBarRef} className='group-forums-search-bar'>
      <TextInput
        autoFocus
        value={draft}
        size='Medium'
        leadingIconName='icon-regular-magnifying-glass'
        placeholder={translate('Action.SearchForums')}
        onChange={handleChange}
        onKeyDown={handleInputKeyDown}
        {...inputAriaProps}
        trailingIconNode={
          <IconButton
            icon='icon-regular-x'
            ariaLabel={translate('Action.Close')}
            size='XSmall'
            variant='Utility'
            isCircular
            onClick={onCollapse}
          />
        }
      />
      {isSuggestionsOpen && (
        <MemberSuggestionsDropdown
          listboxId={MEMBER_SUGGESTIONS_LISTBOX_ID}
          status={status}
          members={members}
          groupId={groupId}
          activeIndex={activeIndex}
          onSelect={selectMember}
        />
      )}
    </div>
  );
};

/**
 * The forums search control: a magnifying-glass trigger that expands into a search bar, plus the
 * filters button and sheet.
 */
const ForumsSearch = (): JSX.Element => {
  const { translate } = useTranslation();
  const {
    groupId,
    mode,
    contentType,
    timeRange,
    filterCategoryId,
    hasContentTypeFilter,
    clearSearch
  } = useForumsSearchContext();

  useEffect(() => {
    logGroupPageExposureEvent({
      groupId,
      context: EventContext.GroupForums,
      exposureType: EventType.GroupForumsSearchExposureEvent
    });
  }, [groupId]);

  const isTextSearch = mode === ForumsMode.Search;

  // Seeded from text Search only, not from any active search: a no-text FilteredBrowse has
  // nothing to show in the input, so it must mount collapsed and leave the category pills
  // visible. The user can still expand it manually.
  const [isExpanded, setIsExpanded] = useState(isTextSearch);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
    clearSearch();
  }, [clearSearch]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    // Counts whenever explicitly present, except in text Search where `Any` means "no
    // restriction". This is what makes a filters-only "Any" search show a badge while a plain
    // text search stays badge-free.
    if (hasContentTypeFilter && !(isTextSearch && contentType === ContentType.Any)) count += 1;
    if (timeRange !== TimeRange.All) count += 1;
    // Only text Search writes searchCategory (an explicit "All categories" included); in no-text
    // FilteredBrowse the route path is the scope, so category never contributes.
    if (isTextSearch && filterCategoryId) count += 1;
    return count;
  }, [hasContentTypeFilter, contentType, timeRange, filterCategoryId, isTextSearch]);

  const filters = (
    <React.Fragment>
      <div className='group-forums-filter-button-wrapper'>
        <IconButton
          icon='icon-filled-three-bars-horizontal-narrowing'
          variant='Utility'
          size='Small'
          isCircular
          ariaLabel={translate('Action.SearchFilters')}
          onClick={() => setIsFiltersOpen(true)}
        />
        {activeFilterCount > 0 && (
          <span className='group-forums-filter-badge'>{activeFilterCount}</span>
        )}
      </div>
      {/* Mounted only while open, so the sheet's useState initializers do the seeding. */}
      {isFiltersOpen && <ForumsSearchFilters onClose={() => setIsFiltersOpen(false)} />}
    </React.Fragment>
  );

  if (!isExpanded) {
    return (
      <div className='group-forums-search-triggers'>
        <IconButton
          icon='icon-regular-magnifying-glass'
          className='group-forums-search-trigger-search'
          variant='Utility'
          size='Small'
          isCircular
          ariaLabel={translate('Action.SearchForums')}
          onClick={() => setIsExpanded(true)}
        />
        {filters}
      </div>
    );
  }

  return (
    <div className='group-forums-search-expanded'>
      <ForumsSearchBar onCollapse={handleCollapse} />
      {filters}
    </div>
  );
};

export default ForumsSearch;
