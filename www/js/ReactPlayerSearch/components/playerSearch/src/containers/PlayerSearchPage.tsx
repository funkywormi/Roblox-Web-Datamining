import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button, ProgressCircle, Snackbar } from "@rbx/foundation-ui";
import { usePlusStatus } from "@rbx/identity-badges";
import { playerSearchConstants } from "../constants/playerSearchConstants";
import { useChatEntrypoint } from "../hooks/useChatEntrypoint";
import { useEventStream } from "../hooks/useEventStream";
import { useKeywordFromUrl } from "../hooks/useKeywordFromUrl";
import { usePlayerSearch } from "../hooks/usePlayerSearch";
import { useRenameFriendsPolicy } from "../hooks/useRenameFriendsPolicy";
import { startChat } from "../services/chatDispatchService";
import { getGameLauncher } from "../services/robloxGlobals";
import { requestFriendship, acceptFriendRequest } from "../services/userRelationshipsService";
import type { SearchResultUser } from "../types/searchedUser";
import EmptyStates from "./EmptyStates";
import PlayerCard from "./PlayerCard";
import ResultsGrid from "./ResultsGrid";
import SearchHeader from "./SearchHeader";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const nonEmptyString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

// httpService rejects with the response itself, not an axios error, unless `fullError` was
// requested (see core-scripts/src/http/intercept.ts), so these fields are read off the rejection.
const friendsApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!isRecord(error)) {
    return fallback;
  }

  if (error.status === 429) {
    return nonEmptyString(error.statusText) ?? fallback;
  }

  const errors = isRecord(error.data) ? error.data.errors : undefined;
  const firstError = Array.isArray(errors) && isRecord(errors[0]) ? errors[0] : undefined;

  return nonEmptyString(firstError?.userFacingMessage) ?? fallback;
};

type FeedbackState = {
  id: number;
  message: string;
};

const keywordStartMarker = "__keyword_start__";
const keywordEndMarker = "__keyword_end__";

const PlayerSearchPage = (): React.JSX.Element => {
  const { translate } = useTranslation();
  const { keyword: urlKeyword, setKeyword: setUrlKeyword } = useKeywordFromUrl();
  const renameFriendsToConnections = useRenameFriendsPolicy();
  const isChatEntrypointEnabled = useChatEntrypoint();
  const {
    inApp,
    inputValue,
    isKeywordTooShort,
    isUserGuest,
    loadMore,
    paginationMethod,
    results,
    resultsLoading,
    setInputValue,
    keyword: activeKeyword,
    unsafeInputDetected,
    markFriendRequestAccepted,
    markFriendRequestSent,
  } = usePlayerSearch(urlKeyword);
  const {
    firePlayerFriendAcceptEvent,
    firePlayerFriendAddEvent,
    firePlayerTileClickEvent,
    firePlayerTileImpressionEvent,
  } = useEventStream();

  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const seenImpressions = useRef<Set<string>>(new Set());
  const { data: plusStatusByUserId } = usePlusStatus(
    useMemo(() => results.map(u => u.id), [results]),
  );

  // Angular clears results and re-fires impressions on every new search, so the dedupe set
  // (which only exists to avoid double-firing within one result set as pages append) has to be
  // cleared when the search changes. A permanent set silently under-reports repeat searches.
  useEffect(() => {
    seenImpressions.current.clear();
  }, [urlKeyword]);

  useEffect(() => {
    results.forEach(user => {
      const impressionKey = `${user.id}:${user.absPos}`;

      if (!seenImpressions.current.has(impressionKey)) {
        seenImpressions.current.add(impressionKey);
        firePlayerTileImpressionEvent(user);
      }
    });
  }, [firePlayerTileImpressionEvent, results]);

  useEffect(() => {
    if (paginationMethod !== "Scroll" || results.length === 0) {
      return;
    }

    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadMore().catch(() => undefined);
          }
        });
      },
      {
        rootMargin: "160px",
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, paginationMethod, results.length]);

  const showFeedback = useCallback((message: string) => {
    setFeedback({
      id: Date.now(),
      message,
    });
  }, []);

  const onSubmitSearch = useCallback(() => {
    const normalizedKeyword = inputValue.trim();

    if (normalizedKeyword === urlKeyword) {
      return;
    }

    setUrlKeyword(normalizedKeyword);
  }, [inputValue, setUrlKeyword, urlKeyword]);

  const onOpenProfile = useCallback(
    (user: SearchResultUser) => {
      firePlayerTileClickEvent(user);
      window.location.assign(user.profileUrl);
    },
    [firePlayerTileClickEvent],
  );

  const onAddFriend = useCallback(
    (user: SearchResultUser) => {
      setPendingUserId(user.id);

      requestFriendship(user.id)
        .then(response => {
          if (response.success) {
            markFriendRequestSent(user.id);
            firePlayerFriendAddEvent(user);
          } else {
            console.error(
              "playerSearch: request-friendship reported no success, leaving the button unchanged",
              { userId: user.id, response },
            );

            if (response.message) {
              showFeedback(response.message);
            }
          }
        })
        .catch((error: unknown) => {
          showFeedback(
            friendsApiErrorMessage(
              error,
              translate(
                "Message.UnableToSendFriendRequest",
                undefined,
                "Unable to send friend request.",
              ),
            ),
          );
        })
        .finally(() => {
          setPendingUserId(null);
        });
    },
    [firePlayerFriendAddEvent, markFriendRequestSent, showFeedback, translate],
  );

  const onAcceptFriend = useCallback(
    (user: SearchResultUser) => {
      setPendingUserId(user.id);

      acceptFriendRequest(user.id)
        .then(() => {
          markFriendRequestAccepted(user.id);
          firePlayerFriendAcceptEvent(user);
        })
        .catch((error: unknown) => {
          showFeedback(
            friendsApiErrorMessage(
              error,
              translate(
                "Message.UnableToAcceptFriendRequest",
                undefined,
                "Unable to accept friend request.",
              ),
            ),
          );
        })
        .finally(() => {
          setPendingUserId(null);
        });
    },
    [firePlayerFriendAcceptEvent, markFriendRequestAccepted, showFeedback, translate],
  );

  const onStartChat = useCallback((user: SearchResultUser) => {
    startChat(user.id);
  }, []);

  const onJoinGame = useCallback(
    (user: SearchResultUser) => {
      try {
        getGameLauncher()?.followPlayerIntoGame(user.id);
      } catch {
        showFeedback(
          translate("Message.UnableToJoinGame", undefined, "Unable to join experience."),
        );
      }
    },
    [showFeedback, translate],
  );

  const heading = useMemo(() => {
    // Markers let us keep the translation intact while styling only the searched keyword.
    const headingWithKeyword = translate("Heading.PlayerResultsFor", {
      startSpan: keywordStartMarker,
      endSpan: keywordEndMarker,
      keyword: activeKeyword,
    });
    const startIndex = headingWithKeyword.indexOf(keywordStartMarker);
    const endIndex = headingWithKeyword.indexOf(keywordEndMarker);

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      return headingWithKeyword;
    }

    const beforeKeyword = headingWithKeyword.slice(0, startIndex);
    const keywordText = headingWithKeyword.slice(startIndex + keywordStartMarker.length, endIndex);
    const afterKeyword = headingWithKeyword.slice(endIndex + keywordEndMarker.length);

    return (
      <span>
        {beforeKeyword}
        <span className="text-body-large">{keywordText}</span>
        {afterKeyword}
      </span>
    );
  }, [activeKeyword, translate]);

  const showNoMatches =
    results.length === 0 &&
    !resultsLoading &&
    !isKeywordTooShort &&
    !unsafeInputDetected &&
    Boolean(activeKeyword);

  return (
    <div className="margin-x-auto flex width-full max-width-[970px] flex-col gap-large padding-x-medium padding-bottom-xxlarge md:padding-x-large">
      <SearchHeader
        heading={heading}
        onChange={setInputValue}
        onSubmit={onSubmitSearch}
        placeholder={translate("Label.Search")}
        showInput={!inApp}
        value={inputValue}
      />

      <EmptyStates
        keyword={activeKeyword}
        keywordMinLength={playerSearchConstants.pageData.keywordMinLength}
        showKeywordTooShort={isKeywordTooShort}
        showNoMatches={showNoMatches}
        showUnsafeInput={unsafeInputDetected}
      />

      <ResultsGrid results={results} sentinelRef={sentinelRef}>
        {results.map(user => (
          <PlayerCard
            isChatEntrypointEnabled={isChatEntrypointEnabled}
            isLoading={pendingUserId === user.id}
            isRobloxPlus={plusStatusByUserId[user.id] === true}
            isUserGuest={isUserGuest}
            key={`${user.id}-${user.absPos}`}
            onAcceptFriend={userToAccept => {
              onAcceptFriend(userToAccept);
            }}
            onAddFriend={userToAdd => {
              onAddFriend(userToAdd);
            }}
            onJoinGame={onJoinGame}
            onOpenProfile={onOpenProfile}
            onStartChat={onStartChat}
            renameFriendsToConnections={renameFriendsToConnections}
            user={user}
          />
        ))}
      </ResultsGrid>

      {resultsLoading ? (
        <div className="flex justify-center">
          <ProgressCircle
            ariaLabel={translate("Label.Loading", undefined, "Loading")}
            size="Large"
            variant="Indeterminate"
          />
        </div>
      ) : null}

      {paginationMethod === "Button" && results.length > 0 && !resultsLoading ? (
        <div className="flex justify-center">
          <Button
            className="width-full"
            onClick={() => {
              loadMore().catch(() => undefined);
            }}
            size="Medium"
            variant="Standard"
          >
            {translate("Action.LoadMore", undefined, "Load more")}
          </Button>
        </div>
      ) : null}

      {feedback ? (
        <div className="flex justify-center">
          <Snackbar
            closeIconAriaLabel={translate("Action.Close", undefined, "Close")}
            key={feedback.id}
            onClose={() => {
              setFeedback(null);
            }}
            shouldAutoDismiss
            title={feedback.message}
          />
        </div>
      ) : null}
    </div>
  );
};

export default PlayerSearchPage;
