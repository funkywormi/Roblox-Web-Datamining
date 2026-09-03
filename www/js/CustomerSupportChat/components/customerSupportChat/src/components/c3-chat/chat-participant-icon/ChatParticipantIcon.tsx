import React, { memo } from "react";

import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";

import useUserHeadshotUrl from "./useUserHeadshotUrl";
import "./ChatParticipantIcon.scss";

const UserThumbnail = memo(({ userId, userName }: { userId: number; userName?: string }) => {
  const url = useUserHeadshotUrl(userId);
  return (
    <span className="thumbnail-2d-container c3-chat-user-icon">
      {url && <img src={url} alt={userName ?? ""} />}
    </span>
  );
});
UserThumbnail.displayName = "UserThumbnail";

/**
 *
 * @param isUser - Indicates if the participant is a user or an agent
 * @param showIcon - Controls the css visibility of the icon, meaning that the container will still be rendered but hidden
 * This is useful to avoid layout shifts when the icon is not shown
 * @returns
 */
const ChatParticipantIcon = ({
  isUser,
  showIcon,
}: {
  isUser: boolean;
  showIcon: boolean;
}): React.ReactElement | null => {
  if (!authenticatedUser.isAuthenticated) return null;
  const icon = isUser ? (
    <UserThumbnail userId={authenticatedUser.id!} userName={authenticatedUser.name ?? undefined} />
  ) : (
    <span className="c3-chat-agent-icon-container">
      <span className="c3-chat-agent-icon icon-logo-r" />
    </span>
  );
  return (
    <span
      data-testid="c3-chat-participant-icon"
      style={{
        visibility: showIcon ? "visible" : "hidden",
      }}
    >
      {icon}
    </span>
  );
};

export default ChatParticipantIcon;
