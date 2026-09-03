import React, { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { UserProfileField, useUserProfiles } from "roblox-user-profiles";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  Thumbnail2d,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
  ThumbnailTypes,
} from "@rbx/thumbnails";
import { Button, FeedbackBanner } from "@rbx/foundation-ui";
import { getLinkedAccounts } from "../../common/request/apis/linkedAccounts";
import {
  GetLinkedAccountsResponse,
  LinkedAccount,
  LinkedAccountsDirection,
} from "../../common/request/types/linkedAccounts";
import translationConstants from "./translationConstants";

const PAGE_SIZE = 10;
const USER_PROFILE_FIELDS = [UserProfileField.Names.CombinedName, UserProfileField.Names.Username];

export const getLinkedAccountsQueryKey = (direction: LinkedAccountsDirection) =>
  ["linked-accounts", direction] as const;

const getLinkedAccountsPage = async (
  direction: LinkedAccountsDirection,
  pageToken: string,
): Promise<GetLinkedAccountsResponse> => {
  const result = await getLinkedAccounts({ direction, pageSize: PAGE_SIZE, pageToken });
  if (result.isError) {
    throw result.errorRaw;
  }
  return result.value;
};

const useLinkedAccountsPages = (direction: LinkedAccountsDirection) => {
  // Fetch one page based on page token.
  const query = useInfiniteQuery({
    queryKey: getLinkedAccountsQueryKey(direction),
    queryFn: ({ pageParam = "" }) =>
      getLinkedAccountsPage(direction, typeof pageParam === "string" ? pageParam : ""),
    getNextPageParam: lastPage => lastPage.nextPageToken || undefined,
    retry: false,
    staleTime: Infinity,
    cacheTime: 0,
  });

  // Takes data from query, combines into a flat account list, and removes duplicates.
  // This only runs when query data changes.
  const accounts = useMemo(
    () =>
      (query.data?.pages ?? [])
        .flatMap(page => page.accountLinks)
        .filter(
          (account, index, allAccounts) =>
            allAccounts.findIndex(previous => previous.accountLinkId === account.accountLinkId) ===
            index,
        ),
    [query.data],
  );

  return {
    accounts,
    hasMore: query.hasNextPage ?? false,
    isError: query.isError,
    isLoading: query.isLoading || query.isFetchingNextPage,
    loadMore: query.fetchNextPage,
    retry: query.refetch,
  };
};

// A single linked account entry.
const LinkedAccountRow = ({
  account,
  combinedName,
  userId,
  username,
}: {
  account: LinkedAccount;
  combinedName?: string | null;
  userId: number;
  username?: string | null;
}): React.JSX.Element => {
  const { translate } = useTranslation();

  return (
    <div
      className="flex items-center gap-medium padding-y-medium border-bottom stroke-default last:stroke-none"
      data-testid={`linked-account-row-${account.accountLinkId}`}
    >
      <div className="avatar avatar-headshot-sm shrink-0 clip radius-circle">
        <Thumbnail2d
          containerClass="block radius-circle"
          targetId={userId}
          format={ThumbnailFormat.webp}
          type={ThumbnailTypes.avatarHeadshot}
          size={ThumbnailAvatarHeadshotSize.size60}
        />
      </div>
      <div className="flex flex-col">
        <span className="flex flex-wrap items-baseline gap-small">
          <span className="text-title-medium">
            {combinedName ||
              username ||
              account.username ||
              translate(translationConstants.unknownUser)}
          </span>
          {username && combinedName && username !== combinedName && (
            <span className="text-body-medium content-muted">@{username}</span>
          )}
        </span>
        <span className="text-body-small content-muted">
          {translate(translationConstants.linkedOn, {
            date: new Date(account.createdTime).toLocaleDateString(undefined, {
              // undefined => browser locale
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          })}
        </span>
      </div>
    </div>
  );
};

// A list of linked accounts, reused for both, incoming and outgoing links.
const LinkedAccountsList = ({
  accounts,
  direction,
  emptyCopy,
  hasMore,
  isError,
  isLoading,
  onLoadMore,
  onRetry,
}: {
  accounts: LinkedAccount[];
  direction: LinkedAccountsDirection;
  emptyCopy: string;
  hasMore: boolean;
  isError: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}): React.JSX.Element => {
  const { translate } = useTranslation();

  // User IDs that do not belong to the logged-in user, and thus are the other party in the link.
  const relatedUserIds = useMemo(
    () =>
      accounts.map(account =>
        direction === LinkedAccountsDirection.Outgoing ? account.linkedUserId : account.ownerUserId,
      ),
    [accounts, direction],
  );
  const { data: userProfiles } = useUserProfiles(relatedUserIds, USER_PROFILE_FIELDS);

  if (isLoading && accounts.length === 0) {
    return (
      <p className="text-body-medium linked-accounts-helper">
        {translate(translationConstants.loading)}
      </p>
    );
  }

  if (isError && accounts.length === 0) {
    return (
      <div className="flex flex-col items-start gap-medium">
        <FeedbackBanner
          className="linked-accounts-banner"
          variant="Emphasis"
          severity="Warning"
          layout="Stacked"
          title={translate(translationConstants.error)}
        />
        <Button variant="Standard" size="Small" onClick={onRetry}>
          {translate(translationConstants.retry)}
        </Button>
      </div>
    );
  }

  if (accounts.length === 0) {
    return <p className="text-body-medium content-muted margin-none">{translate(emptyCopy)}</p>;
  }

  return (
    <React.Fragment>
      <div className="flex flex-col">
        {accounts.map(account => {
          const relatedUserId =
            direction === LinkedAccountsDirection.Outgoing
              ? account.linkedUserId
              : account.ownerUserId;
          const profile = userProfiles?.[relatedUserId];
          return (
            <LinkedAccountRow
              key={account.accountLinkId}
              account={account}
              userId={relatedUserId}
              combinedName={profile?.names?.combinedName}
              username={profile?.names?.username}
            />
          );
        })}
      </div>
      {hasMore && (
        <Button variant="Standard" size="Small" onClick={onLoadMore} isDisabled={isLoading}>
          {translate(translationConstants.loadMore)}
        </Button>
      )}
    </React.Fragment>
  );
};

// A dashboard of linked accounts, containing both directions of links.
export const LinkedAccountsDashboard = (): React.JSX.Element => {
  const { translate } = useTranslation();
  const outgoing = useLinkedAccountsPages(LinkedAccountsDirection.Outgoing);
  const incoming = useLinkedAccountsPages(LinkedAccountsDirection.Incoming);

  return (
    <div className="flex flex-col gap-xxlarge" data-testid="linked-accounts-dashboard">
      <div className="flex flex-col gap-medium" data-testid="linked-accounts-outgoing-section">
        <div className="flex flex-col gap-xxsmall">
          <span className="text-title-medium">
            {translate(translationConstants.outgoing.heading)}
          </span>
          <span className="text-body-small content-muted">
            {translate(translationConstants.outgoing.description)}
          </span>
        </div>
        <LinkedAccountsList
          accounts={outgoing.accounts}
          direction={LinkedAccountsDirection.Outgoing}
          emptyCopy={translationConstants.outgoing.empty}
          hasMore={outgoing.hasMore}
          isError={outgoing.isError}
          isLoading={outgoing.isLoading}
          onLoadMore={() => {
            outgoing.loadMore().catch(() => undefined);
          }}
          onRetry={() => {
            outgoing.retry().catch(() => undefined);
          }}
        />
      </div>
      <div className="flex flex-col gap-medium" data-testid="linked-accounts-incoming-section">
        <div className="flex flex-col gap-xxsmall">
          <span className="text-title-medium">
            {translate(translationConstants.incoming.heading)}
          </span>
          <span className="text-body-small content-muted">
            {translate(translationConstants.incoming.description)}
          </span>
        </div>
        <LinkedAccountsList
          accounts={incoming.accounts}
          direction={LinkedAccountsDirection.Incoming}
          emptyCopy={translationConstants.incoming.empty}
          hasMore={incoming.hasMore}
          isError={incoming.isError}
          isLoading={incoming.isLoading}
          onLoadMore={() => {
            incoming.loadMore().catch(() => undefined);
          }}
          onRetry={() => {
            incoming.retry().catch(() => undefined);
          }}
        />
      </div>
    </div>
  );
};

export { getLinkedAccounts } from "../../common/request/apis/linkedAccounts";
export { LinkedAccountsDirection } from "../../common/request/types/linkedAccounts";
export type { GetLinkedAccountsResponse } from "../../common/request/types/linkedAccounts";
export default LinkedAccountsDashboard;
