// Currently only used to display quick sign in modal for devices in Roblox App with non compatible two sv methods.

import React, { useEffect } from "react";
import { Modal } from "react-style-guide";
import { CrossDeviceLoginDisplayCodeService, DeviceMeta, Hybrid } from "Roblox";
import InlineChallengeBody from "../../../common/inlineChallengeBody";
import { InlineChallengeFooter } from "../../../common/inlineChallengeFooter";
import { FooterButtonConfig, FragmentModalFooter } from "../../../common/modalFooter";
import SupportHelp from "../components/supportHelp";
import useTwoStepVerificationContext from "../hooks/useTwoStepVerificationContext";
import { ActionType } from "../interface";

type Props = {
  setModalTitleText: React.Dispatch<React.SetStateAction<string>>;
  children?: React.ReactNode;
};

const QuickSignInInput: React.FC<Props> = ({ setModalTitleText, children }: Props) => {
  const {
    state: { renderInline, resources, metadata, actionType },
  } = useTwoStepVerificationContext();

  // to change the modal title in twoStepVerification.tsx once this mounts
  useEffect(() => {
    setModalTitleText(resources.Title.UseAnotherDevice);
  }, [setModalTitleText, resources.Title.UseAnotherDevice]);

  const inRobloxApp = DeviceMeta && DeviceMeta().isInApp;

  const getBodyText = function () {
    if (inRobloxApp) {
      return actionType === ActionType.Login
        ? resources.Description.QuickLoginUA
        : resources.Description.QuickLogin;
    }
    return resources.Description.QuickLogin;
  };

  // Determine body text based on whether we're in RobloxApp and action type
  const bodyText = getBodyText();

  const handleButtonClick = () => {
    if (inRobloxApp) {
      // In RobloxApp webview, close the hybrid overlay
      if (Hybrid && Hybrid.Overlay) {
        Hybrid.Overlay.close(() => undefined);
      }
    } else {
      // On web, open the cross-device login modal
      CrossDeviceLoginDisplayCodeService.openModal();
    }
  };

  const buttonLabel = inRobloxApp ? resources.Action.Okay : resources.Action.Continue;

  const positiveButton: FooterButtonConfig = {
    content: buttonLabel,
    label: buttonLabel,
    enabled: true,
    action: handleButtonClick,
  };

  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
  const FooterElement = renderInline ? InlineChallengeFooter : FragmentModalFooter;
  const lockIconClassName = renderInline
    ? "inline-challenge-protection-shield-icon"
    : "modal-protection-shield-icon";
  const marginBottomClassName = renderInline
    ? "inline-challenge-margin-bottom"
    : "modal-margin-bottom";
  const marginBottomXLargeClassName = renderInline
    ? "inline-challenge-margin-bottom-xlarge"
    : "modal-margin-bottom-xlarge";
  return (
    metadata && (
      <React.Fragment>
        <BodyElement>
          <div className={lockIconClassName} />
          <p className={marginBottomXLargeClassName}>{bodyText}</p>
          {children}
        </BodyElement>
        <FooterElement positiveButton={positiveButton} negativeButton={null}>
          <SupportHelp className={marginBottomClassName} />
        </FooterElement>
      </React.Fragment>
    )
  );
};

export default QuickSignInInput;
