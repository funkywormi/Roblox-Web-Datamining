import React, { useCallback, useState } from "react";
import { withTranslations } from "react-utilities";
import { Button, Pagination } from "react-style-guide";
import { AvatarCardList } from "@rbx/core-ui";
import { Snackbar } from "@rbx/foundation-ui";
import { TranslationProvider } from "@rbx/core-scripts/react";
import { TrustedFriendsModal } from "@rbx/friends-common";
import translationConfig from "../translation.config";
import useTrustedFriendRequests from "../hooks/useTrustedFriendRequests";
import { usePendingTrustedFriendRequestsIxp } from "../hooks/usePendingTrustedFriendRequestsIxp";
import TrustedFriendRequestCard from "./TrustedFriendRequestCard";

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

type TrustedFriendRequestsSectionProps = {
  translate: TranslateFn;
};

const TrustedFriendRequestsSection = ({
  translate,
}: TrustedFriendRequestsSectionProps): React.JSX.Element | null => {
  const {
    count,
    pageRequests,
    isLoading,
    isError,
    currentPage,
    showPagination,
    hasNextPage,
    goToPage,
    ignoreRequest,
    ignoreAllRequests,
    ignoringSenderId,
    isIgnoringAll,
    isActionsBusy,
    actionError,
    clearActionError,
    refresh,
  } = useTrustedFriendRequests();

  const hasPendingTrustedFriendRequests = count > 0 || pageRequests.length > 0;
  const { data: isPendingTrustedFriendRequestsEnabled, isLoading: isIxpLoading } =
    usePendingTrustedFriendRequestsIxp(hasPendingTrustedFriendRequests);

  const [acceptModalUserId, setAcceptModalUserId] = useState<number | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);

  const handleAccept = useCallback((senderId: number) => {
    setAcceptModalUserId(senderId);
    setIsAcceptModalOpen(true);
  }, []);

  const handleCloseAcceptModal = useCallback((_isSuccess: boolean) => {
    setIsAcceptModalOpen(false);
  }, []);

  const handleIgnoreRequest = useCallback(
    (senderId: number) => {
      ignoreRequest(senderId);
    },
    [ignoreRequest],
  );

  // pageRequests.length determines if we have cached entries, if so
  // we can show section even while loading otherwise we hide
  const showSection =
    hasPendingTrustedFriendRequests &&
    !isIxpLoading &&
    isPendingTrustedFriendRequestsEnabled &&
    !(isLoading && pageRequests.length === 0);

  // Show error only if we have no cached entries, otherwise its fine
  const showListError = isError && pageRequests.length === 0;
  const canIgnoreAll = count > 0 && !showListError;

  const acceptModal =
    acceptModalUserId !== null ? (
      <TranslationProvider key="trusted-accept-modal" config={translationConfig}>
        <TrustedFriendsModal
          open={isAcceptModalOpen}
          userId={acceptModalUserId}
          onClose={handleCloseAcceptModal}
          onComplete={refresh}
        />
      </TranslationProvider>
    ) : null;

  const sectionContent = showSection ? (
    <div
      className="trusted-friend-requests-section friends-content section"
      data-testid="trusted-friend-requests-section"
    >
      {actionError ? (
        <Snackbar title={translate(actionError)} onClose={clearActionError} shouldAutoDismiss />
      ) : null}
      <div className="container-header request-tab-header">
        <div className="friends-subtitle">
          <h2>
            {translate("Label.TrustedFriendRequests")}
            {showListError ? null : ` (${count})`}
          </h2>
        </div>
        {canIgnoreAll && (
          <Button
            variant="control"
            size="xs"
            className="ignore-button see-all-link"
            isLoading={isIgnoringAll}
            onClick={() => {
              if (isActionsBusy) {
                return;
              }
              ignoreAllRequests();
            }}
            data-testid="trusted-friend-requests-ignore-all"
          >
            {translate("Action.IgnoreAll")}
          </Button>
        )}
      </div>

      {showListError ? (
        <div className="section-content-off">{translate("Message.DefaultError")}</div>
      ) : (
        <AvatarCardList data={pageRequests}>
          {(request: { senderId: number }) => {
            const isIgnoring = ignoringSenderId === request.senderId;
            return (
              <TrustedFriendRequestCard
                key={request.senderId}
                senderId={request.senderId}
                onAccept={handleAccept}
                onIgnore={handleIgnoreRequest}
                isIgnoring={isIgnoring}
                isDisabled={isActionsBusy}
              />
            );
          }}
        </AvatarCardList>
      )}

      {showPagination && pageRequests.length > 0 && !showListError && (
        <Pagination current={currentPage} hasNext={hasNextPage} onChange={goToPage} />
      )}
    </div>
  ) : null;

  return (
    <React.Fragment>
      {sectionContent}
      {acceptModal}
    </React.Fragment>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- withTranslations injects translate; public props omit it
export default withTranslations(
  TrustedFriendRequestsSection,
  translationConfig,
) as unknown as React.ComponentType;
