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
import { acceptAccountLink, getPendingAccountLink } from "../../common/request/apis/linkedAccounts";
import { getUserByUsername } from "../../common/request/apis/users";
import { ActionError, UsernameInput } from "./LinkedAccountsComponents";
import translationConstants from "./translationConstants";

const ReviewLinkedAccountRequest = ({
  onAccepted,
}: {
  onAccepted: () => void;
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

  const verifyAndAccept = async (): Promise<void> => {
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
      const pendingResult = await getPendingAccountLink(user.id);
      if (pendingResult.isError) {
        setErrorTranslationKey(
          pendingResult.errorStatusCode === 404
            ? translationConstants.pendingRequestNotFound
            : translationConstants.actionError,
        );
        return;
      }
      const pendingIntent = pendingResult.value?.accountLinkUpdateIntent;
      if (!pendingIntent) {
        setErrorTranslationKey(translationConstants.pendingRequestNotFound);
        return;
      }
      const acceptResult = await acceptAccountLink({
        accountLinkUpdateIntentId: pendingIntent.accountLinkUpdateIntentId,
      });
      if (acceptResult.isError) {
        setErrorTranslationKey(
          acceptResult.errorStatusCode === 429
            ? translationConstants.limitReached
            : translationConstants.actionError,
        );
        return;
      }
      onAccepted();
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
        data-testid="linked-account-open-review-dialog"
      >
        {translate(translationConstants.review.action)}
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
            <DialogTitle>{translate(translationConstants.review.heading)}</DialogTitle>
            <p className="text-body-medium content-muted">
              {translate(translationConstants.review.description)}
            </p>
            <div className="margin-top-medium flex flex-col gap-xxsmall">
              <label className="text-label-small" htmlFor="linked-account-requester-username">
                {translate(translationConstants.review.usernameLabel)}
              </label>
              <UsernameInput
                value={username}
                onChange={setUsername}
                placeholder={translate(translationConstants.review.placeholder)}
                testId="linked-account-review-username"
                inputId="linked-account-requester-username"
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
                verifyAndAccept().catch(() => undefined);
              }}
              data-testid="linked-account-verify-and-accept"
            >
              {translate(translationConstants.review.submitAction)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};

export default ReviewLinkedAccountRequest;
