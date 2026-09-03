import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Icon, ListItem } from "@rbx/foundation-ui";
import { getAbsoluteTime } from "../utils/timeHelper";
import routes from "../constants/routes";

interface TicketListItemProps {
  id: string;
  title: string;
  universeId: number;
  universeName: string;
  updateTime: string;
  showUnreadIndicator: boolean;
  showDivider: boolean;
}

const TicketListItem: React.FC<TicketListItemProps> = ({
  id,
  title,
  universeId,
  universeName,
  updateTime,
  showUnreadIndicator,
  showDivider,
}) => {
  const history = useHistory();
  const { search } = useLocation();
  const absoluteCreatedTime = getAbsoluteTime(new Date(updateTime));

  const onTicketClicked = () => {
    history.push({
      pathname: routes.getTicketRoute(universeId, id),
      search,
    });
  };

  return (
    <ListItem
      className="ticket-list-item"
      title={title}
      metadata={universeName}
      divider={showDivider ? "Inset" : "None"}
      leading={
        <div className="flex items-center justify-center width-[8px] shrink-0 margin-left-[4px]">
          {showUnreadIndicator && (
            <span className="width-[8px] height-[8px] bg-[var(--color-extended-blue-600)] radius-circle" />
          )}
        </div>
      }
      trailing={
        <div className="flex items-center shrink-0">
          <div className="text-label-medium width-[64px]">{absoluteCreatedTime}</div>
          <Icon className="margin-x-small" name="icon-filled-chevron-large-right" />
        </div>
      }
      onSelect={onTicketClicked}
      isContained={false}
    />
  );
};

export default TicketListItem;
