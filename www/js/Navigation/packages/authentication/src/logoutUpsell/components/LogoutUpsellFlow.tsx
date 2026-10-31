import { useState, type ReactElement } from "react";
import AddEmailContent, { type AddEmailTranslations } from "./AddEmailContent";
import LogoutUpsellModal from "./LogoutUpsellModal";
import PasskeyUpsellContent, { type PasskeyUpsellTranslations } from "./PasskeyUpsellContent";
import VerifyEmailContent, { type VerifyEmailTranslations } from "./VerifyEmailContent";
import { LogoutUpsellScreen, type LogoutUpsellScreenName } from "../constants/logoutUpsellScreens";
import {
  AddEmailOrigin,
  type AddEmailOriginName,
  sendDismissClick,
} from "../services/logoutUpsellEvents";

export type PasskeyLogoutUpsellOptions = {
  kind: "passkey";
  translations: PasskeyUpsellTranslations;
  showAddEmail: boolean;
  addEmailTranslations?: AddEmailTranslations;
  verifyEmailTranslations?: VerifyEmailTranslations;
  onLogout: () => void;
};

export type EmailLogoutUpsellOptions = {
  kind: "email";
  closeLabel: string;
  addEmailTranslations: AddEmailTranslations;
  verifyEmailTranslations: VerifyEmailTranslations;
  onLogout: () => void;
};

export type LogoutUpsellFlowOptions = PasskeyLogoutUpsellOptions | EmailLogoutUpsellOptions;

export type LogoutUpsellFlowProps = {
  options: LogoutUpsellFlowOptions;
  onClose: () => void;
};

export const LogoutUpsellFlow = ({
  options,
  onClose,
}: LogoutUpsellFlowProps): ReactElement | null => {
  const [screen, setScreen] = useState<LogoutUpsellScreenName>(
    options.kind === "email" ? LogoutUpsellScreen.AddEmail : LogoutUpsellScreen.PasskeyUpsell,
  );
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [addEmailOrigin, setAddEmailOrigin] = useState<AddEmailOriginName>(
    options.kind === "email" ? AddEmailOrigin.EmailUpsell : AddEmailOrigin.Passkey,
  );

  const { addEmailTranslations, verifyEmailTranslations } = options;
  const closeLabel =
    options.kind === "email" ? options.closeLabel : options.translations.closeLabel;

  const closeAndLogout = () => {
    onClose();
    options.onLogout();
  };

  let content: ReactElement;
  if (screen === LogoutUpsellScreen.AddEmail && addEmailTranslations) {
    content = (
      <AddEmailContent
        translations={addEmailTranslations}
        origin={addEmailOrigin}
        // The email-only upsell has no other screen to sign out from.
        onSignOut={options.kind === "email" ? closeAndLogout : undefined}
        onContinue={email => {
          setSubmittedEmail(email);
          setScreen(LogoutUpsellScreen.VerifyEmail);
        }}
      />
    );
  } else if (screen === LogoutUpsellScreen.VerifyEmail && verifyEmailTranslations) {
    content = (
      <VerifyEmailContent
        translations={verifyEmailTranslations}
        email={submittedEmail}
        onContinueToSignOut={closeAndLogout}
        onChangeEmail={() => {
          setAddEmailOrigin(AddEmailOrigin.ChangeEmail);
          setScreen(LogoutUpsellScreen.AddEmail);
        }}
      />
    );
  } else if (options.kind === "passkey") {
    content = (
      <PasskeyUpsellContent
        translations={options.translations}
        showAddEmail={options.showAddEmail}
        onSignOut={closeAndLogout}
        onPasskeyRegistered={onClose}
        onAddEmail={
          options.showAddEmail && addEmailTranslations
            ? () => {
                setAddEmailOrigin(AddEmailOrigin.Passkey);
                setScreen(LogoutUpsellScreen.AddEmail);
              }
            : undefined
        }
      />
    );
  } else {
    return null;
  }

  return (
    <LogoutUpsellModal
      closeLabel={closeLabel}
      onClose={() => {
        sendDismissClick(screen);
        onClose();
      }}
    >
      {content}
    </LogoutUpsellModal>
  );
};

export default LogoutUpsellFlow;
