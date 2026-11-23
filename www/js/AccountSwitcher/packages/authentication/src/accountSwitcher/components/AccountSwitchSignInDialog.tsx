import type { ReactElement } from "react";
import { Dialog, DialogContent } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import { confirmationModalOrigins } from "../constants/accountSwitcherConstants";
import type { SwitchFailure, SwitchFailureReason } from "../utils/accountSwitcherUsers";
import { AccountSwitcherBaseConfirmationModal } from "./AccountSwitcherBaseConfirmationModal";

const signInDialogBodyKeys = {
  invalidSession: "Description.StaleSessionSignInAgain",
  switchError: "Description.SomethingWentWrongSignInAgain",
  requestFailed: "Description.SomethingWentWrongSignInAgain",
} as const satisfies Record<SwitchFailureReason, string>;

export type AccountSwitchSignInDialogProps = {
  readonly failure: SwitchFailure | null;
  readonly onClose: () => void;
  readonly onSignIn: () => void;
};

export const AccountSwitchSignInDialog = ({
  failure,
  onClose,
  onSignIn,
}: AccountSwitchSignInDialogProps): ReactElement => {
  const translate = useTranslations("Authentication.AccountSwitch");

  return (
    <Dialog
      open={failure != null}
      isModal
      size="Small"
      type="Default"
      hasCloseAffordance={false}
      onOpenChange={open => {
        if (!open) {
          onClose();
        }
      }}
    >
      {failure != null && (
        <DialogContent>
          <AccountSwitcherBaseConfirmationModal
            origin={confirmationModalOrigins.UnavailableError}
            isTextLeftAligned
            localizedTitleText={translate("Header.CantSwitchAccountsSentenceCase")}
            localizedBodyText={translate(signInDialogBodyKeys[failure.reason])}
            localizedPrimaryButtonText={translate("Action.SignIn")}
            primaryButtonCallback={() => {
              onClose();
              onSignIn();
            }}
          />
        </DialogContent>
      )}
    </Dialog>
  );
};
