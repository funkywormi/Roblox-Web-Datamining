import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { UserTicket } from "../types";
import { GameDetailsResponse } from "../services/gamesService";
import useTicketActivityList from "../hooks/useTicketActivityList";
import TicketActivity from "./TicketActivity";

interface TicketActivityListProps {
  ticket: UserTicket;
  gameDetails?: GameDetailsResponse | null;
}

const TicketActivityList: React.FC<TicketActivityListProps> = ({ ticket, gameDetails }) => {
  const { translate } = useTranslation();
  const activities = useTicketActivityList(ticket, gameDetails);

  return (
    <div className="margin-bottom-medium">
      <h2 className="text-heading-medium margin text-no-wrap text-truncate-end">
        {ticket.summary.title}
      </h2>
      <h3 className="text-heading-small padding-bottom-medium">{translate("Heading.Activity")}</h3>
      {activities.map((activity, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <TicketActivity key={index} {...activity} />
      ))}
    </div>
  );
};

export default TicketActivityList;
