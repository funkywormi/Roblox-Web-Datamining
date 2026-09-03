import React from "react";
import { urlService } from "core-utilities";
import ModernCardHeader from "../../common/modernCardComponent/modernCardHeader";
import ModernCardBody from "../../common/modernCardComponent/modernCardBody";
import {
  CardFooterButtonConfig,
  ModernCardFooter,
} from "../../common/modernCardComponent/modernCardFooter";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import { ProfileSection } from "../commonHelpers";

const CannotRecoverAccount: React.FC = () => {
  const {
    state: { userIdToRecover, username, combinedName, resources },
    dispatch,
  } = useAccountRecoveryContext();

  const okButton: CardFooterButtonConfig = {
    content: resources.Action.Ok,
    label: resources.Action.Ok,
    enabled: true,
    action: () => {
      const redirectUrl = urlService.getAbsoluteUrl("/login");
      window.location.href = redirectUrl;
    },
  };

  return (
    <React.Fragment>
      <ModernCardHeader headerText={resources.Heading.CannotRecoverAccount} />
      <ModernCardBody>
        <ProfileSection
          userId={userIdToRecover ?? 0}
          combinedName={combinedName ?? ""}
          username={username ?? ""}
        />
        <p className="padding-bottom-large">{resources.Description.CannotRecoverAccount}</p>
      </ModernCardBody>
      <ModernCardFooter positiveButton={okButton} negativeButton={null} />
    </React.Fragment>
  );
};

export default CannotRecoverAccount;
