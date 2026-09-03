import React, { useMemo, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
  FeedbackBanner,
} from "@rbx/foundation-ui";
import {
  Thumbnail2d,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
  ThumbnailTypes,
} from "@rbx/thumbnails";
import { UserProfileField, useUserProfiles } from "roblox-user-profiles";
import { LinkedAccount, LinkedAccountsDirection } from "../../common/request/types/linkedAccounts";
import { ActionError } from "./LinkedAccountsComponents";
import type { PendingOutgoingAccount } from "./RequestLinkedAccount";
import translationConstants from "./translationConstants";

const USER_PROFILE_FIELDS = [UserProfileField.Names.CombinedName, UserProfileField.Names.Username];

const LinkedAccountRow = ({
  account,
  combinedName,
  userId,
  username,
  onDelete,
}: {
  account: LinkedAccount;
  combinedName?: string | null;
  userId: number;
  username?: string | null;
  onDelete: (account: LinkedAccount) => Promise<void>;
}): React.JSX.Element => {
  const { translate } = useTranslation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleDelete = async (): Promise<void> => {
    setHasError(false);
    setIsDeleting(true);
    try {
      await onDelete(account);
      setIsDeleteDialogOpen(false);
    } catch {
      setHasError(true);
    } finally {
      setIsDeleting(false);
    }
  };

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
      <div className="flex flex-col flex-grow min-width-0">
        <span className="flex flex-wrap items-baseline gap-small">
          <span className="text-title-medium break-words">
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
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          })}
        </span>
      </div>
      <Button
        variant="Standard"
        size="Small"
        isDisabled={isDeleting}
        onClick={() => {
          setHasError(false);
          setIsDeleteDialogOpen(true);
        }}
        data-testid={`linked-account-unlink-${account.accountLinkId}`}
      >
        {translate(translationConstants.unlink)}
      </Button>
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={open => {
          setIsDeleteDialogOpen(open);
          if (!open) setHasError(false);
        }}
        size="Small"
        isModal
        hasCloseAffordance
        closeLabel={translate(translationConstants.cancel)}
      >
        <DialogContent className="width-full">
          <DialogBody>
            <DialogTitle>{translate(translationConstants.unlink)}</DialogTitle>
            <p className="text-body-medium content-muted">
              {translate(translationConstants.unlinkConfirmation)}
            </p>
            {hasError && (
              <div data-testid={`linked-account-unlink-error-${account.accountLinkId}`}>
                <ActionError />
              </div>
            )}
          </DialogBody>
          <DialogFooter className="flex gap-small justify-end">
            <Button
              variant="Standard"
              size="Small"
              isDisabled={isDeleting}
              onClick={() => {
                setIsDeleteDialogOpen(false);
              }}
              data-testid={`linked-account-unlink-cancel-${account.accountLinkId}`}
            >
              {translate(translationConstants.cancel)}
            </Button>
            <Button
              variant="Emphasis"
              size="Small"
              isDisabled={isDeleting}
              onClick={() => {
                handleDelete().catch(() => undefined);
              }}
              data-testid={`linked-account-unlink-confirm-${account.accountLinkId}`}
            >
              {translate(translationConstants.unlink)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PendingOutgoingAccountRow = ({
  account,
  onCancel,
}: {
  account: PendingOutgoingAccount;
  onCancel: (account: PendingOutgoingAccount) => Promise<void>;
}): React.JSX.Element => {
  const { translate } = useTranslation();
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasError, setHasError] = useState(false);

  const cancel = async (): Promise<void> => {
    setHasError(false);
    setIsCancelling(true);
    try {
      await onCancel(account);
    } catch {
      setHasError(true);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div
      className="flex items-center gap-medium padding-y-medium border-bottom stroke-default last:stroke-none"
      data-testid={`pending-linked-account-row-${account.intent.accountLinkUpdateIntentId}`}
    >
      <div className="avatar avatar-headshot-sm shrink-0 clip radius-circle opacity-50">
        <Thumbnail2d
          containerClass="block radius-circle"
          targetId={account.userId}
          format={ThumbnailFormat.webp}
          type={ThumbnailTypes.avatarHeadshot}
          size={ThumbnailAvatarHeadshotSize.size60}
        />
      </div>
      <div className="flex flex-col flex-grow min-width-0">
        <span className="flex flex-wrap items-baseline gap-small">
          <span className="text-title-medium break-words">
            {account.displayName || account.username}
          </span>
          {account.displayName && account.username !== account.displayName && (
            <span className="text-body-medium content-muted">@{account.username}</span>
          )}
        </span>
        <span className="text-body-small content-muted">
          {translate(translationConstants.request.pending)}
        </span>
        {hasError && (
          <div
            data-testid={`pending-linked-account-cancel-error-${account.intent.accountLinkUpdateIntentId}`}
          >
            <ActionError />
          </div>
        )}
      </div>
      <div className="flex items-center gap-small shrink-0">
        <span className="padding-x-small padding-y-xxsmall radius-circle bg-surface-100 text-label-small">
          {translate(translationConstants.pendingApproval)}
        </span>
        <Button
          variant="Link"
          size="Small"
          isDisabled={isCancelling}
          onClick={() => {
            cancel().catch(() => undefined);
          }}
          data-testid={`pending-linked-account-cancel-${account.intent.accountLinkUpdateIntentId}`}
        >
          {translate(translationConstants.cancelRequest)}
        </Button>
      </div>
    </div>
  );
};

const LinkedAccountsList = ({
  accounts,
  direction,
  emptyCopy,
  hasMore,
  isError,
  isLoading,
  onLoadMore,
  onRetry,
  onDelete,
  pendingAccounts = [],
  onCancelPending,
}: {
  accounts: LinkedAccount[];
  direction: LinkedAccountsDirection;
  emptyCopy: string;
  hasMore: boolean;
  isError: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onDelete: (account: LinkedAccount) => Promise<void>;
  pendingAccounts?: PendingOutgoingAccount[];
  onCancelPending?: (account: PendingOutgoingAccount) => Promise<void>;
}): React.JSX.Element => {
  // The API returns ACTIVE links only. Append local PENDING outgoing requests
  // so a request remains visible until the server promotes, cancels, or expires it.
  const { translate } = useTranslation();
  const relatedUserIds = useMemo(
    () =>
      accounts.map(account =>
        direction === LinkedAccountsDirection.Outgoing ? account.linkedUserId : account.ownerUserId,
      ),
    [accounts, direction],
  );
  const { data: userProfiles } = useUserProfiles(relatedUserIds, USER_PROFILE_FIELDS);

  if (isLoading && accounts.length === 0 && pendingAccounts.length === 0) {
    return (
      <p className="text-body-medium linked-accounts-helper">
        {translate(translationConstants.loading)}
      </p>
    );
  }

  if (isError && accounts.length === 0 && pendingAccounts.length === 0) {
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

  if (accounts.length === 0 && pendingAccounts.length === 0) {
    return <p className="text-body-medium content-muted margin-none">{translate(emptyCopy)}</p>;
  }

  return (
    <React.Fragment>
      {isError && accounts.length === 0 && (
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
      )}
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
              onDelete={onDelete}
            />
          );
        })}
        {onCancelPending &&
          pendingAccounts.map(account => (
            <PendingOutgoingAccountRow
              key={account.intent.accountLinkUpdateIntentId}
              account={account}
              onCancel={onCancelPending}
            />
          ))}
      </div>
      {hasMore && (
        <Button variant="Standard" size="Small" onClick={onLoadMore} isDisabled={isLoading}>
          {translate(translationConstants.loadMore)}
        </Button>
      )}
    </React.Fragment>
  );
};

export default LinkedAccountsList;
