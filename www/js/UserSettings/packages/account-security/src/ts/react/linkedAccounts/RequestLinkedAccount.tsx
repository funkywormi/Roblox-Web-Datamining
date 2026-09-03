import React, { useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { requestAccountLink } from "../../common/request/apis/linkedAccounts";
import { getUserByUsername } from "../../common/request/apis/users";
import {
  AccountLinkUpdateIntent,
  LinkedAccountsLinkType,
} from "../../common/request/types/linkedAccounts";
import { ActionError, UsernameInput } from "./LinkedAccountsComponents";
import translationConstants from "./translationConstants";

export type PendingOutgoingAccount = {
  userId: number;
  username: string;
  displayName: string;
  intent: AccountLinkUpdateIntent;
};

// Creates an outgoing recovery-account request and returns local display data.
// The caller retains it because PENDING links are hidden from normal list reads.
const RequestLinkedAccount = ({
  onRequestSent,
}: {
  onRequestSent: (account: PendingOutgoingAccount) => void;
}): React.JSX.Element => {
  const { translate } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorTranslationKey, setErrorTranslationKey] = useState<string | null>(null);

  const close = (): void => {
    setIsOpen(false);
    setUsername("");
    setErrorTranslationKey(null);
  };

  const requestLink = async (): Promise<void> => {
    setErrorTranslationKey(null);
    setIsSubmitting(true);
    try {
      const userResult = await getUserByUsername(username.trim());
      if (userResult.isError) {
        setErrorTranslationKey(translationConstants.actionError);
        return;
      }
      const user = userResult.value.data[0];
      if (!user) {
        setErrorTranslationKey(translationConstants.usernameNotFound);
        return;
      }
      const result = await requestAccountLink({
        linkedUserId: user.id,
        desiredLinkType: LinkedAccountsLinkType.LinkedRecoveryAccount,
      });
      if (result.isError) {
        setErrorTranslationKey(
          result.errorStatusCode === 429
            ? translationConstants.limitReached
            : translationConstants.actionError,
        );
        return;
      }
      onRequestSent({
        userId: user.id,
        username: user.name,
        displayName: user.displayName,
        intent: result.value.accountLinkUpdateIntent,
      });
      close();
    } catch {
      setErrorTranslationKey(translationConstants.actionError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <Button
        variant="Emphasis"
        size="Small"
        className="min-width-[180px] justify-center"
        onClick={() => {
          setIsOpen(true);
        }}
        data-testid="linked-account-open-request-dialog"
      >
        {translate(translationConstants.request.addAction)}
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={open => {
          if (!open) close();
        }}
        size="Small"
        isModal
        hasCloseAffordance
        closeLabel={translate(translationConstants.cancel)}
      >
        <DialogContent className="width-full">
          <DialogBody>
            <DialogTitle>{translate(translationConstants.request.heading)}</DialogTitle>
            <p className="text-body-medium content-muted">
              {translate(translationConstants.request.description)}
            </p>
            <div className="margin-top-medium">
              <label className="sr-only" htmlFor="linked-account-request-username">
                {translate(translationConstants.request.placeholder)}
              </label>
              <UsernameInput
                value={username}
                onChange={setUsername}
                placeholder={translate(translationConstants.request.placeholder)}
                testId="linked-account-request-username"
                inputId="linked-account-request-username"
              />
            </div>
            {errorTranslationKey && <ActionError translationKey={errorTranslationKey} />}
          </DialogBody>
          <DialogFooter className="flex gap-small justify-end">
            <Button variant="Standard" size="Small" onClick={close} isDisabled={isSubmitting}>
              {translate(translationConstants.cancel)}
            </Button>
            <Button
              variant="Emphasis"
              size="Small"
              isDisabled={isSubmitting || username.trim().length === 0}
              onClick={() => {
                requestLink().catch(() => undefined);
              }}
              data-testid="linked-account-send-request"
            >
              {translate(translationConstants.request.action)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default RequestLinkedAccount;
