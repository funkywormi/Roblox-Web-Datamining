import React from "react";
import { Modal } from "react-style-guide";
import { Button } from "@rbx/foundation-ui";
import { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import { ForceActionRedirect } from "@rbx/generic-challenge-types";
import InlineChallenge from "../../../common/inlineChallenge";
import InlineChallengeBody from "../../../common/inlineChallengeBody";
import { FragmentModalHeader, HeaderButtonType } from "../../../common/modalHeader";
import { translationsParametersByKey } from "../app.config";
import useCloseModal from "../hooks/useCloseModal";
import useForceActionRedirectContext from "../hooks/useForceActionRedirectContext";
import useForcePasswordlessLogin from "../hooks/useForcePasswordlessLogin";

// The strings this challenge needs beyond the header, body and action every type has.
const getExtraResources = (
  translate: ForceActionRedirect.ForceActionRedirectTranslateFunction,
) => ({
  Error: translate("ForcePasswordlessLogin.Error"),
  EmailOtp: translate("ForcePasswordlessLogin.EmailOtp"),
  Passkey: translate("ForcePasswordlessLogin.Passkey"),
  Help: translate(
    "ForcePasswordlessLogin.Help",
    translationsParametersByKey("ForcePasswordlessLogin.Help"),
  ),
});

type LoginOption = {
  isOffered: boolean;
  title: string;
  icon: TTailwindIconClass;
  onSelect: () => void;
  testId: string;
};

/**
 * The force passwordless login challenge: password login is unavailable, so it offers the
 * passwordless methods the login page supports.
 */
const ForcePasswordlessLogin: React.FC<{
  translate: ForceActionRedirect.ForceActionRedirectTranslateFunction;
}> = ({ translate }) => {
  const {
    state: { renderInline, resources: baseResources, isModalVisible },
  } = useForceActionRedirectContext();
  const resources = React.useMemo(
    () => ({ ...baseResources, ...getExtraResources(translate) }),
    [baseResources, translate],
  );
  const closeModal = useCloseModal();
  const {
    isHandedOff,
    isOpeningQuickLogin,
    hasError,
    isPasskeyOffered,
    isEmailOtpOffered,
    startQuickLogin,
    startPasskey,
    startEmailOtp,
  } = useForcePasswordlessLogin();

  if (isHandedOff) return null;

  const loginOptions: LoginOption[] = [
    {
      isOffered: isPasskeyOffered,
      title: resources.Passkey,
      icon: "icon-regular-key",
      onSelect: startPasskey,
      testId: "force-passwordless-login-passkey",
    },
    {
      isOffered: true,
      title: resources.Action,
      icon: "icon-regular-squares-grid-qr",
      onSelect: startQuickLogin,
      testId: "force-passwordless-login-action",
    },
    {
      isOffered: isEmailOtpOffered,
      title: resources.EmailOtp,
      icon: "icon-regular-envelope",
      onSelect: startEmailOtp,
      testId: "force-passwordless-login-email-otp",
    },
  ];

  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
  const lockIconClassName = renderInline
    ? "inline-challenge-protection-shield-icon"
    : "modal-protection-shield-icon";
  const marginBottomXLargeClassName = renderInline
    ? "inline-challenge-margin-bottom-xlarge"
    : "modal-margin-bottom-xlarge";
  const optionsMarginClassName = renderInline ? "" : "modal-margin-bottom-large";
  const marginBottomClassName = renderInline
    ? "inline-challenge-margin-bottom"
    : "modal-margin-bottom";

  const pageContent = (
    <BodyElement>
      <div className={lockIconClassName} data-testid="force-passwordless-login-challenge" />
      <p
        className={marginBottomXLargeClassName}
        data-testid="force-passwordless-login-body"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: resources.Body,
        }}
      />
      <div
        data-testid="force-passwordless-login-options"
        className={`flex flex-col gap-small ${optionsMarginClassName}`}
      >
        {loginOptions
          .filter(option => option.isOffered)
          .map(option => (
            <Button
              key={option.testId}
              variant="Standard"
              size="Medium"
              icon={option.icon}
              className="width-full"
              isDisabled={isOpeningQuickLogin}
              onClick={option.onSelect}
              data-testid={option.testId}
            >
              {option.title}
            </Button>
          ))}
      </div>
      {hasError && (
        <p className="text-error" role="alert" data-testid="force-passwordless-login-error">
          {resources.Error}
        </p>
      )}
      <p
        className={`text-footer ${marginBottomClassName}`}
        data-testid="force-passwordless-login-help"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: resources.Help,
        }}
      />
    </BodyElement>
  );

  return renderInline ? (
    <InlineChallenge titleText={resources.Header}>{pageContent}</InlineChallenge>
  ) : (
    <Modal className="modal-modern" show={isModalVisible} onHide={closeModal} backdrop="static">
      <FragmentModalHeader
        headerText={resources.Header}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled
        headerInfo={null}
      />
      {pageContent}
    </Modal>
  );
};

export default ForcePasswordlessLogin;
