import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import MemberInfoDisplay from '../../configureGroupMembers/components/MemberInfoDisplay';
import { getMemberOptionId } from '../hooks/useMemberSuggestionsNav';
import { MemberSearchStatus } from '../hooks/useMemberSearch';
import { User } from '../types';
import { groupsConfig } from '../translation.config';

// Single-row placeholder while the (debounced) member search is in flight.
const MemberSuggestionSkeleton = (): JSX.Element => (
  <div className='group-forums-member-suggestion-skeleton'>
    <div className='group-forums-member-suggestion-avatar-skeleton group-forums-skeleton' />
    <div className='group-forums-member-suggestion-lines-skeleton'>
      <div className='group-forums-member-suggestion-line-skeleton group-forums-skeleton' />
      <div className='group-forums-member-suggestion-line-skeleton group-forums-skeleton' />
    </div>
  </div>
);

export type MemberSuggestionsDropdownProps = {
  // Must match the input's `aria-controls`; also the stem for each option id.
  listboxId: string;
  status: MemberSearchStatus;
  members: User[];
  groupId: number;
  // Index of the keyboard-active option, or -1. Owned by useMemberSuggestionsNav.
  activeIndex: number;
  onSelect: (member: User) => void;
} & WithTranslationsProps;

/**
 * The listbox half of an @-mention combobox: renders the loading / error / prompt / empty /
 * results states of a member lookup. Pair with useMemberSearch (data) and
 * useMemberSuggestionsNav (keys + ARIA props).
 *
 * Styles currently live in css/groupForums/_forumsSearch.scss, the feature that introduced this
 * control; a second consumer should move that block somewhere shared.
 */
const MemberSuggestionsDropdown = ({
  listboxId,
  status,
  members,
  groupId,
  activeIndex,
  onSelect,
  translate
}: MemberSuggestionsDropdownProps): JSX.Element => {
  // The non-result states all render the same single line, so pick the copy rather than
  // repeating the markup. Under the search threshold (e.g. a bare "@") we prompt rather than
  // claim no members matched.
  const emptyStateMessage = (): string | null => {
    if (status === 'error') {
      return translate('Label.MemberSearchError');
    }
    if (status === 'belowMinLength') {
      return translate('Label.MemberSearchHint');
    }
    if (members.length === 0) {
      return translate('Label.NoMembersFound');
    }
    return null;
  };

  const renderContents = (): JSX.Element => {
    if (status === 'loading') {
      return <MemberSuggestionSkeleton />;
    }

    const message = emptyStateMessage();
    if (message !== null) {
      return (
        <div className='group-forums-member-suggestions-message content-muted text-body-small'>
          {message}
        </div>
      );
    }

    return (
      <React.Fragment>
        {members.map((member, index) => (
          // Keyboard support lives on the input: focus stays put and the active option is named
          // by aria-activedescendant, so options carry no key handlers of their own.
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <div
            key={member.userId}
            id={getMemberOptionId(listboxId, index)}
            role='option'
            tabIndex={-1}
            aria-selected={index === activeIndex}
            className='group-forums-member-suggestion-item'
            onClick={event => {
              // MemberInfoDisplay renders profile <Link> anchors; preventDefault stops the
              // row/anchor click from navigating to the profile so it only selects the member.
              event.preventDefault();
              onSelect(member);
            }}>
            <MemberInfoDisplay user={member} groupId={groupId} />
          </div>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div id={listboxId} role='listbox' className='group-forums-member-suggestions'>
      {renderContents()}
    </div>
  );
};

export default withTranslations(MemberSuggestionsDropdown, groupsConfig);
