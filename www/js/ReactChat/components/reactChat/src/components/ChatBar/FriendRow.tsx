import classNames from "classnames";
import type { TChatConversation } from "../../types/chat";
import { presenceDotClassByType } from "../../utils/presenceStyles";
import AvatarHeadshot from "../AvatarHeadshot";
import ChatRow from "./ChatRow";

type TFriendRowProps = {
  conversation: TChatConversation;
  isSelected?: boolean;
  onOpenConversation: (layoutId: string) => void;
};

const FriendRow = ({ conversation, isSelected, onOpenConversation }: TFriendRowProps) => {
  const participant = conversation.participants[0];

  if (!participant) {
    return null;
  }

  return (
    <ChatRow
      conversation={conversation}
      isSelected={isSelected}
      onOpenConversation={onOpenConversation}
      avatar={
        <div className="relative shrink-0">
          <AvatarHeadshot
            userId={participant.id}
            displayName={participant.displayName}
            containerClassName="size-800 radius-circle bg-shift-300 clip"
          />
          {participant.presence !== "Offline" && (
            <span
              className={classNames(
                "react-chat-presence-dot absolute size-200 radius-circle stroke-standard stroke-surface-100",
                presenceDotClassByType[participant.presence],
              )}
              aria-hidden="true"
            />
          )}
        </div>
      }
    />
  );
};

export default FriendRow;
