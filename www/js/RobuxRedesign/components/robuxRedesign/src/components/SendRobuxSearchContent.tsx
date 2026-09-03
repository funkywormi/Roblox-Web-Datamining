import React, { useCallback, useMemo } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { SheetBody } from "@rbx/foundation-ui";
import { TFriend } from "@rbx/friends-common/types/friendsCarousel";
import { useUserSearch } from "../hooks/useUserSearch";
import type { TransferSendUserSelectedSource } from "../hooks/useTransfersTracking";
import {
  OmniSearchUser,
  USER_SEARCH_MIN_CHARACTERS,
  USER_SEARCH_TREATMENT_MAX_RESULTS,
} from "../services/userSearchService";
import { FriendListSearchInput } from "./FriendListSearchInput";
import { MyFriendsList } from "./MyFriendsList";
import { PeopleSearchResults } from "./PeopleSearchResults";

export type SendRobuxUserSelection = {
  userId: number;
  context: TransferSendUserSelectedSource;
};

type SendRobuxSearchContentProps = {
  friends: TFriend[];
  isLoading: boolean;
  error: Error | null;
  isLoggedIn: boolean;
  onSelectUser: (selection: SendRobuxUserSelection) => void;
};

const normalizeFriendSearchText = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, "");

export function SendRobuxSearchContent({
  friends,
  isLoading,
  error,
  isLoggedIn,
  onSelectUser,
}: SendRobuxSearchContentProps) {
  const { translate } = useTranslation();
  const currentUserId = authenticatedUser()?.id ?? undefined;
  const excludedUserIds = useMemo(
    () => (currentUserId !== undefined && currentUserId > 0 ? [currentUserId] : []),
    [currentUserId],
  );
  const { searchText, setSearchText, users, isSearching, clearSearch } = useUserSearch({
    maxResults: USER_SEARCH_TREATMENT_MAX_RESULTS,
    excludedUserIds,
    invalidateRequestOnClear: true,
  });

  const normalizedSearchText = normalizeFriendSearchText(searchText);
  const hasSearchText = normalizedSearchText.length > 0;
  const settledSearchUserIds = useMemo(
    () => new Set(isSearching ? [] : users.map(user => user.contentId)),
    [isSearching, users],
  );

  const filteredFriends = useMemo(() => {
    if (!hasSearchText) return friends;
    return friends.filter(
      friend =>
        normalizeFriendSearchText(friend.combinedName ?? "").includes(normalizedSearchText) ||
        settledSearchUserIds.has(friend.id),
    );
  }, [friends, hasSearchText, normalizedSearchText, settledSearchUserIds]);

  const allFriendIds = useMemo(() => new Set(friends.map(friend => friend.id)), [friends]);

  const dedupedSearchUsers = useMemo(
    () => users.filter(user => !allFriendIds.has(user.contentId)),
    [allFriendIds, users],
  );

  const handleSelectSearchUser = useCallback(
    (user: OmniSearchUser) => {
      onSelectUser({ userId: user.contentId, context: "search" });
    },
    [onSelectUser],
  );

  const friendsCount = { count: filteredFriends.length };
  const myFriendsHeading = isLoggedIn ? translate("Label.MyFriendsWithCount", friendsCount) : "";
  // A zero count means either a search matched no friends or the user has none;
  // per design the heading disappears in both cases instead of reading "(0)".
  const showFriendsSection = isLoggedIn && (isLoading || filteredFriends.length > 0);
  const showNoResults =
    normalizedSearchText.length >= USER_SEARCH_MIN_CHARACTERS &&
    !isSearching &&
    !isLoading &&
    filteredFriends.length === 0 &&
    dedupedSearchUsers.length === 0;

  return (
    <React.Fragment>
      {/* The input sits outside the scrolling body rather than pinning inside
          it, so fractional scroll offsets cannot make it shimmer. It supplies
          its own 20px gutter now that it no longer inherits SheetBody's. */}
      <div
        className="send-robux-search-row shrink-0 bg-surface-100 padding-x-xlarge padding-top-xsmall padding-bottom-large"
        data-testid="send-robux-search-row"
      >
        <FriendListSearchInput
          searchText={searchText}
          setSearchText={setSearchText}
          clearSearch={clearSearch}
        />
      </div>
      <SheetBody className="hide-scrollbar clip-x send-robux-sheet-body-inset">
        <div className="flex flex-col padding-bottom-large">
          {showFriendsSection && (
            // Wrapping the section makes it the heading's sticky container, so
            // the heading scrolls away with its own rows instead of staying
            // pinned while the next section's heading paints over it.
            <div className="flex flex-col" data-testid="send-robux-friends-section">
              <h2
                className="text-title-large content-emphasis bg-surface-100 send-robux-section-heading"
                style={{ position: "sticky", top: 0, zIndex: 1 }}
              >
                {myFriendsHeading}
              </h2>
              <MyFriendsList
                friends={filteredFriends}
                isLoading={isLoading}
                error={error}
                ariaLabel={myFriendsHeading}
                showEmptyState={false}
                rowVariant="InlineFilter"
                useInternalScroll={false}
                onSelectUser={user => {
                  onSelectUser({ userId: user.id, context: "friends_list" });
                }}
              />
            </div>
          )}
          {!isSearching && hasSearchText && (
            <PeopleSearchResults
              users={dedupedSearchUsers}
              onSelectUser={handleSelectSearchUser}
              hasSectionAbove={showFriendsSection}
            />
          )}
          {showNoResults && (
            <div
              className="flex items-center justify-center padding-medium"
              role="status"
              aria-live="polite"
            >
              <span className="text-body-medium content-muted">
                {translate("Label.NoResultsFound")}
              </span>
            </div>
          )}
        </div>
      </SheetBody>
    </React.Fragment>
  );
}
