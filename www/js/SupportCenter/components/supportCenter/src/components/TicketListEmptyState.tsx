import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import InfoPanel from "./InfoPanel";

interface TicketListEmptyStateProps {
  returnUrl?: string;
}

const TicketListEmptyState: React.FC<TicketListEmptyStateProps> = ({ returnUrl }) => {
  const { translate } = useTranslation();
  return (
    <InfoPanel
      iconName="icon-regular-speech-bubble-align-center"
      heading={translate("Message.NoSupportTickets")}
      message={translate("Description.NoSupportTickets")}
      buttonText={translate("Action.Back")}
      href={returnUrl}
    />
  );
};

export default TicketListEmptyState;
