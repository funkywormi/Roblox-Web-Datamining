import React from "react";
import { DeviceMeta, EnvironmentUrls } from "Roblox";
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

  let baseUrl = `${EnvironmentUrls.websiteUrl}/login/forgot-password-or-username`;
  let target = "_self";
  if (DeviceMeta && (DeviceMeta().isUWPApp || DeviceMeta().isWin32App)) {
    baseUrl = `${EnvironmentUrls.websiteUrl}/login/forgot-password-or-username`;
    target = "_blank";
  } else if (DeviceMeta && DeviceMeta().isInApp) {
    baseUrl = "roblox://navigation/account_recovery";
    target = "_blank";
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
