import type { TChatConversation } from "../../types/chat";
import AvatarHeadshot from "../AvatarHeadshot";

type TTypingIndicatorProps = {
  conversation: TChatConversation;
};

const TypingIndicator = ({ conversation }: TTypingIndicatorProps) => {
  const participant = conversation.participants.find(({ id }) =>
    conversation.typingParticipantIds.includes(id),
  );

  if (!conversation.isTyping || !participant) {
    return null;
  }

  return (
    <li className="flex items-center gap-small padding-x-medium padding-y-small" aria-hidden="true">
      <AvatarHeadshot
        userId={participant.id}
        displayName={participant.displayName}
        containerClassName="size-700 radius-circle bg-shift-300 clip"
      />
      <div className="react-chat-message-bubble react-chat-message-bubble-incoming flex items-center gap-xxsmall padding-x-medium padding-y-small">
        <span className="inline-block size-[6px] radius-circle bg-system-neutral" />
        <span className="inline-block size-[6px] radius-circle bg-system-neutral" />
        <span className="inline-block size-[6px] radius-circle bg-system-neutral" />
      </div>
    </li>
  );
};

export default TypingIndicator;
