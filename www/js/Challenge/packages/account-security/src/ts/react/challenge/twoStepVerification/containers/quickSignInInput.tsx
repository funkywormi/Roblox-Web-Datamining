// Currently only used to display quick sign in modal for devices in Roblox App with non compatible two sv methods.

import React, { useEffect } from "react";
import { Modal } from "react-style-guide";
import { openModal as openCrossDeviceLoginDisplayCodeModal } from "@rbx/authentication/crossDeviceLoginDisplayCodeModal/services/crossDeviceLoginDisplayCodeService";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import InlineChallengeBody from "../../../common/inlineChallengeBody";
import SupportHelp from "../components/supportHelp";
import VerificationFooter, { VerificationFooterButton } from "../components/verificationFooter";
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

  const inRobloxApp = getDeviceMeta()?.isInApp;

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
      // In RobloxApp webview, close the hybrid overlay. window.Roblox.Hybrid is injected by
      // the native app webview bridge (no importable module); read defensively so off-app
      // paths no-op instead of throwing.
      const Hybrid = (
        window.Roblox as
          | { Hybrid?: { Overlay?: { close: (callback: () => void) => void } } }
          | undefined
      )?.Hybrid;
      Hybrid?.Overlay?.close(() => undefined);
    } else {
      // On web, open the cross-device login modal via the imported service.
      openCrossDeviceLoginDisplayCodeModal();
    }
  };

  const buttonLabel = inRobloxApp ? resources.Action.Okay : resources.Action.Continue;

  const positiveButton: VerificationFooterButton = {
    label: buttonLabel,
    enabled: true,
    loading: false,
    action: handleButtonClick,
  };

  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
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
        </BodyElement>
        <VerificationFooter positiveButton={positiveButton}>
          {children}
          <SupportHelp className={marginBottomClassName} />
        </VerificationFooter>
      </React.Fragment>
    )
  );
};

export default QuickSignInInput;
