import type { TChatConversation } from "../../types/chat";
import GroupAvatar from "../GroupAvatar";
import ChatRow from "./ChatRow";

type TGroupRowProps = {
  conversation: TChatConversation;
  onOpenConversation: (layoutId: string) => void;
};

const GroupRow = ({ conversation, onOpenConversation }: TGroupRowProps) => (
  <ChatRow
    conversation={conversation}
    onOpenConversation={onOpenConversation}
    avatar={
      <GroupAvatar
        participants={conversation.participants}
        containerClassName="size-800 shrink-0 radius-circle bg-surface-300 stroke-standard stroke-surface-100"
      />
    }
  />
);

export default GroupRow;
