import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import InfoPanel from "./InfoPanel";

interface TicketListErrorStateProps {
  onClick?: () => void;
}

const TicketListErrorState: React.FC<TicketListErrorStateProps> = ({ onClick }) => {
  const { translate } = useTranslation();
  return (
    <InfoPanel
      iconName="icon-regular-triangle-exclamation"
      heading={translate("Response.SomethingWentWrong")}
      message={translate("Response.UnexpectedError")}
      buttonText={translate("Action.Retry")}
      onClick={onClick}
    />
  );
};

export default TicketListErrorState;
