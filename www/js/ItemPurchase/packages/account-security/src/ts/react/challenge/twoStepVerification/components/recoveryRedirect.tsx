import React from "react";
import EnvironmentUrls from "@rbx/environment-urls";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import useTwoStepVerificationContext from "../hooks/useTwoStepVerificationContext";
import { ActionType } from "../interface";

type Props = {
  username: string;
  actionType: ActionType;
  recoverySessionId?: string;
};

/**
 * A button to initiate 2SV recovery.
 */
const RecoveryRedirect: React.FC<Props> = ({ username, actionType, recoverySessionId }: Props) => {
  const {
    state: { resources },
  } = useTwoStepVerificationContext();

  const deviceMeta = getDeviceMeta();
  let baseUrl = `${EnvironmentUrls.websiteUrl}/login/forgot-password-or-username`;
  let target = "_self";
  if (deviceMeta?.isUWPApp || deviceMeta?.isWin32App) {
    baseUrl = `${EnvironmentUrls.websiteUrl}/login/forgot-password-or-username`;
    target = "_blank";
  } else if (deviceMeta?.isInApp) {
    baseUrl = "roblox://navigation/account_recovery";
    // Keep the default "_self": Android's in-app WebView routes target="_blank"
    // navigations through onCreateWindow (unhandled for custom schemes), so a
    // "_blank" roblox:// deeplink is silently dropped and never reaches the
    // native app. Same-tab navigation is intercepted correctly on both
    // Android and iOS. (AA-7746)
    target = "_self";
  }

  let origin = "";
  if (actionType === ActionType.Login) {
    origin = "login2SV";
  } else if (actionType === ActionType.PasswordReset) {
    origin = "passwordReset2SV";
  }

  let recoveryUrl = `${baseUrl}?origin=${origin}&username=${username}`;
  if (actionType === ActionType.PasswordReset) {
    recoveryUrl += `&recoverySessionId=${recoverySessionId ?? ""}`;
  }

  return (
    <div className="text-center forgot-credentials-link">
      <a
        id="forgot-credentials-link"
        className="text-link"
        href={recoveryUrl}
        target={target}
        rel="noreferrer"
      >
        {resources.Action.Recover}
      </a>
    </div>
  );
};

export default RecoveryRedirect;
