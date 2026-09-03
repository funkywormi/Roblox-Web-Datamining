import React, { useState } from "react";
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
import { RecoveryIntent } from "../../common/request/types/accountRecovery";
import { ActionError } from "./LinkedAccountsComponents";
import translationConstants from "./translationConstants";

const USER_PROFILE_FIELDS = [UserProfileField.Names.CombinedName, UserProfileField.Names.Username];

const PendingRecoveryRequestRow = ({
  intent,
  combinedName,
  username,
  onResolve,
}: {
  intent: RecoveryIntent;
  combinedName?: string | null;
  username?: string | null;
  onResolve: (intent: RecoveryIntent, isApproved: boolean) => Promise<void>;
}): React.JSX.Element => {
  const { translate } = useTranslation();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [hasError, setHasError] = useState(false);

  const resolve = async (isApproved: boolean): Promise<void> => {
    setHasError(false);
    setIsResolving(true);
    try {
      await onResolve(intent, isApproved);
      if (isApproved) setIsApproveDialogOpen(false);
    } catch {
      setHasError(true);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div
      className="flex items-center gap-medium padding-medium radius-medium bg-action-standard"
      data-testid={`recovery-intent-${intent.recoveryIntentId}`}
    >
      <div className="avatar avatar-headshot-sm shrink-0 clip radius-circle">
        <Thumbnail2d
          containerClass="block radius-circle"
          targetId={intent.mainAccountUserId}
          format={ThumbnailFormat.webp}
          type={ThumbnailTypes.avatarHeadshot}
          size={ThumbnailAvatarHeadshotSize.size60}
        />
      </div>
      <div className="flex flex-col flex-grow min-width-0">
        <span className="flex flex-wrap items-baseline gap-small">
          <span className="text-title-medium break-words">
            {combinedName || username || translate(translationConstants.unknownUser)}
          </span>
          {username && combinedName && username !== combinedName && (
            <span className="text-body-medium content-muted">@{username}</span>
          )}
        </span>
        <span className="text-body-small content-muted">
          {translate(translationConstants.recoveryIntents.active)}
        </span>
        {hasError && !isApproveDialogOpen && <ActionError />}
      </div>
      <div className="flex items-center gap-small shrink-0">
        <Button
          variant="Emphasis"
          size="Small"
          isDisabled={isResolving}
          onClick={() => {
            setHasError(false);
            setIsApproveDialogOpen(true);
          }}
          data-testid={`recovery-intent-approve-${intent.recoveryIntentId}`}
        >
          {translate(translationConstants.approve)}
        </Button>
        <Button
          variant="Link"
          size="Small"
          isDisabled={isResolving}
          onClick={() => {
            resolve(false).catch(() => undefined);
          }}
          data-testid={`recovery-intent-deny-${intent.recoveryIntentId}`}
        >
          {translate(translationConstants.deny)}
        </Button>
      </div>
      <Dialog
        open={isApproveDialogOpen}
        onOpenChange={open => {
          setIsApproveDialogOpen(open);
          if (!open) setHasError(false);
        }}
        size="Small"
        isModal
        hasCloseAffordance
        closeLabel={translate(translationConstants.cancel)}
      >
        <DialogContent className="width-full">
          <DialogBody>
            <DialogTitle>
              {translate(translationConstants.recoveryIntents.approvalConfirmation.heading)}
            </DialogTitle>
            <p className="text-body-medium content-muted">
              {translate(translationConstants.recoveryIntents.approvalConfirmation.description)}
            </p>
            {hasError && <ActionError />}
          </DialogBody>
          <DialogFooter className="flex gap-small justify-end">
            <Button
              variant="Standard"
              size="Small"
              isDisabled={isResolving}
              onClick={() => {
                setIsApproveDialogOpen(false);
                setHasError(false);
              }}
              data-testid={`recovery-intent-approve-cancel-${intent.recoveryIntentId}`}
            >
              {translate(translationConstants.cancel)}
            </Button>
            <Button
              variant="Emphasis"
              size="Small"
              isDisabled={isResolving}
              onClick={() => {
                resolve(true).catch(() => undefined);
              }}
              data-testid={`recovery-intent-approve-confirm-${intent.recoveryIntentId}`}
            >
              {translate(translationConstants.approve)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PendingRecoveryRequests = ({
  intents,
  isError,
  isLoading,
  onRetry,
  onResolve,
}: {
  intents: RecoveryIntent[];
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
  onResolve: (intent: RecoveryIntent, isApproved: boolean) => Promise<void>;
}): React.JSX.Element | null => {
  const { translate } = useTranslation();
  const { data: userProfiles } = useUserProfiles(
    intents.map(intent => intent.mainAccountUserId),
    USER_PROFILE_FIELDS,
  );

  if (isLoading || (!isError && intents.length === 0)) return null;

  return (
    <section className="flex flex-col gap-medium" data-testid="pending-recovery-requests">
      <div className="flex flex-col gap-xxsmall">
        <span className="text-title-medium">
          {translate(translationConstants.recoveryIntents.heading)}
        </span>
        <span className="text-body-small content-muted">
          {translate(translationConstants.recoveryIntents.description)}
        </span>
      </div>
      {isError && (
        <div className="flex flex-col items-start gap-medium">
          <FeedbackBanner
            className="linked-accounts-banner"
            variant="Emphasis"
            severity="Warning"
            layout="Stacked"
            title={translate(translationConstants.error)}
          />
          <Button
            variant="Standard"
            size="Small"
            onClick={onRetry}
            data-testid="pending-recovery-requests-retry"
          >
            {translate(translationConstants.retry)}
          </Button>
        </div>
      )}
      {intents.map(intent => {
        const profile = userProfiles?.[intent.mainAccountUserId];
        return (
          <PendingRecoveryRequestRow
            key={intent.recoveryIntentId}
            intent={intent}
            combinedName={profile?.names?.combinedName}
            username={profile?.names?.username}
            onResolve={onResolve}
          />
        );
      })}
    </section>
  );
};

export default PendingRecoveryRequests;
