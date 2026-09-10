import { useTranslation } from "@rbx/core-scripts/react";
import type { TChatConversation } from "../../../types/chat";
import AvatarHeadshot from "../../AvatarHeadshot";

type TOsaInlineCardProps = {
  conversation: TChatConversation;
};

/**
 * Non-blocking UK-OSA disclosure shown at the top of a 1:1 thread the first time the viewer opens
 * it: friend avatar + name, a "first conversation with" heading, and the OSA description. Rendered
 * above the message list; the viewer can still chat.
 */
const OsaInlineCard = ({ conversation }: TOsaInlineCardProps) => {
  const { translate } = useTranslation();
  const friend = conversation.participants[0];
  const friendUsernameLabel = friend?.username ? `@${friend.username}` : "";
  const heading = friend
    ? translate("Heading.FirstConversationWith", { displayName: friend.displayName })
    : translate("Heading.FirstConversationWithThisUser");

  return (
    <div className="react-chat-osa-inline-card flex flex-col gap-small bg-surface-200 padding-medium">
      {friend && (
        <a href={friend.profileUrl} className="flex items-center gap-small" aria-hidden="true">
          <AvatarHeadshot
            userId={friend.id}
            displayName={friend.displayName}
            containerClassName="size-800 radius-circle bg-shift-300 clip"
          />
          <div className="min-width-none grow-1">
            <div className="text-body-medium content-emphasis text-truncate-end">
              {friend.displayName}
            </div>
            {friendUsernameLabel && (
              <div className="text-caption-medium content-muted text-truncate-end">
                {friendUsernameLabel}
              </div>
            )}
          </div>
        </a>
      )}
      <div className="text-label-medium content-emphasis">{heading}</div>
      <div className="text-caption-medium content-default">
        {translate("Description.InlineContextCardDescription")}
      </div>
    </div>
  );
};

export default OsaInlineCard;
