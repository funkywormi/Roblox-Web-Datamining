import React, { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "@rbx/core-scripts/react";
import { Snackbar } from "@rbx/foundation-ui";
import {
  cancelAccountLink,
  deleteAccountLink,
  getLinkedAccounts,
} from "../../common/request/apis/linkedAccounts";
import {
  GetLinkedAccountsResponse,
  LinkedAccount,
  LinkedAccountsDirection,
} from "../../common/request/types/linkedAccounts";
import LinkedAccountsList from "./LinkedAccountsList";
import PendingRecoveryRequests from "./PendingRecoveryRequests";
import { useRecoveryIntents } from "./RecoveryIntents";
import RequestLinkedAccount from "./RequestLinkedAccount";
import ReviewLinkedAccountRequest from "./ReviewLinkedAccountRequest";
import type { PendingOutgoingAccount } from "./RequestLinkedAccount";
import translationConstants from "./translationConstants";

const PAGE_SIZE = 10;
const PENDING_LINK_POLL_INTERVAL = 15000;

// A newly requested link is not returned by the ACTIVE-only list APIs. Keep it
// locally until it becomes active, is canceled, or expires.
const isPendingOutgoingAccountExpired = (account: PendingOutgoingAccount): boolean =>
  new Date(account.intent.expiryTime).getTime() <= Date.now();

export const getLinkedAccountsQueryKey = (direction: LinkedAccountsDirection) =>
  ["linked-accounts", direction] as const;

const getLinkedAccountsPage = async (
  direction: LinkedAccountsDirection,
  pageToken: string,
): Promise<GetLinkedAccountsResponse> => {
  const result = await getLinkedAccounts({ direction, pageSize: PAGE_SIZE, pageToken });
  if (result.isError) throw result.errorRaw;
  return result.value;
};

const useLinkedAccountsPages = (direction: LinkedAccountsDirection, shouldPoll = false) => {
  const query = useInfiniteQuery({
    queryKey: getLinkedAccountsQueryKey(direction),
    queryFn: ({ pageParam = "" }) =>
      getLinkedAccountsPage(direction, typeof pageParam === "string" ? pageParam : ""),
    getNextPageParam: lastPage => lastPage.nextPageToken || undefined,
    retry: false,
    staleTime: Infinity,
    cacheTime: 0,
    refetchInterval: shouldPoll ? PENDING_LINK_POLL_INTERVAL : false,
    refetchIntervalInBackground: false,
  });

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

export const LinkedAccountsDashboard = (): React.JSX.Element => {
  const { translate } = useTranslation();
  // The dashboard coordinates the feature's three independent views: outgoing
  // links, incoming links, and recovery requests awaiting a decision.
  const [pendingOutgoingAccounts, setPendingOutgoingAccounts] = useState<PendingOutgoingAccount[]>(
    [],
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const outgoing = useLinkedAccountsPages(
    LinkedAccountsDirection.Outgoing,
    pendingOutgoingAccounts.length > 0,
  );
  const incoming = useLinkedAccountsPages(LinkedAccountsDirection.Incoming);
  const recoveryIntents = useRecoveryIntents();
  const refreshLinks = (): void => {
    outgoing.retry().catch(() => undefined);
    incoming.retry().catch(() => undefined);
  };
  const removeLink = async (account: LinkedAccount): Promise<void> => {
    const result = await deleteAccountLink({ accountLinkId: account.accountLinkId });
    if (result.isError) throw result.errorRaw;
    refreshLinks();
  };
  const handleRequestSent = (account: PendingOutgoingAccount): void => {
    setPendingOutgoingAccounts(previous => [...previous, account]);
    setToastMessage(
      translate(translationConstants.request.success, { username: account.username }),
    );
    refreshLinks();
  };
  const cancelPendingRequest = async (account: PendingOutgoingAccount): Promise<void> => {
    const result = await cancelAccountLink({
      accountLinkUpdateIntentId: account.intent.accountLinkUpdateIntentId,
    });
    if (result.isError) throw result.errorRaw;
    setPendingOutgoingAccounts(previous =>
      previous.filter(
        pending =>
          pending.intent.accountLinkUpdateIntentId !== account.intent.accountLinkUpdateIntentId,
      ),
    );
  };

  useEffect(() => {
    setPendingOutgoingAccounts(previous => {
      const activeAccounts = previous.filter(
        pending =>
          !outgoing.accounts.some(account => account.linkedUserId === pending.userId) &&
          !isPendingOutgoingAccountExpired(pending),
      );
      return activeAccounts.length === previous.length ? previous : activeAccounts;
    });
  }, [outgoing.accounts]);

  useEffect(() => {
    if (pendingOutgoingAccounts.length === 0) return undefined;

    const pruneExpiredPendingAccounts = (): void => {
      setPendingOutgoingAccounts(previous => {
        const activeAccounts = previous.filter(
          pending => !isPendingOutgoingAccountExpired(pending),
        );
        return activeAccounts.length === previous.length ? previous : activeAccounts;
      });
    };

    pruneExpiredPendingAccounts();
    const interval = window.setInterval(pruneExpiredPendingAccounts, PENDING_LINK_POLL_INTERVAL);
    return () => {
      window.clearInterval(interval);
    };
  }, [pendingOutgoingAccounts.length]);

  return (
    <div className="flex flex-col gap-xxlarge" data-testid="linked-accounts-dashboard">
      <PendingRecoveryRequests
        intents={recoveryIntents.intents}
        isLoading={recoveryIntents.isLoading}
        isError={recoveryIntents.isError}
        onRetry={() => {
          recoveryIntents.retry().catch(() => undefined);
        }}
        onResolve={recoveryIntents.resolveIntent}
      />
      <div className="flex flex-col gap-medium" data-testid="linked-accounts-outgoing-section">
        <div className="flex items-start justify-between gap-medium">
          <div className="flex flex-col gap-xxsmall">
            <span className="text-title-medium">
              {translate(translationConstants.outgoing.heading)}
            </span>
            <span className="text-body-small content-muted">
              {translate(translationConstants.outgoing.description)}
            </span>
          </div>
          <RequestLinkedAccount onRequestSent={handleRequestSent} />
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
          onDelete={removeLink}
          pendingAccounts={pendingOutgoingAccounts}
          onCancelPending={cancelPendingRequest}
        />
      </div>
      <div className="flex flex-col gap-medium" data-testid="linked-accounts-incoming-section">
        <div className="flex items-start justify-between gap-medium">
          <div className="flex flex-col gap-xxsmall">
            <span className="text-title-medium">
              {translate(translationConstants.incoming.heading)}
            </span>
            <span className="text-body-small content-muted">
              {translate(translationConstants.incoming.description)}
            </span>
          </div>
          <ReviewLinkedAccountRequest
            onAccepted={() => {
              incoming.retry().catch(() => undefined);
            }}
          />
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
          onDelete={removeLink}
        />
      </div>
      {toastMessage && (
        <Snackbar
          title={toastMessage}
          onClose={() => {
            setToastMessage(null);
          }}
          shouldAutoDismiss
        />
      )}
    </div>
  );
};

export { getLinkedAccounts } from "../../common/request/apis/linkedAccounts";
export { LinkedAccountsDirection } from "../../common/request/types/linkedAccounts";
export type { GetLinkedAccountsResponse } from "../../common/request/types/linkedAccounts";
export default LinkedAccountsDashboard;
