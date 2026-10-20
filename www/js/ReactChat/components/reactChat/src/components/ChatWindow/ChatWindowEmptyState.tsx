import { Icon } from "@rbx/foundation-ui";
import useChatTranslate from "../../hooks/useChatTranslate";

/** The unified chat window's conversation pane when no conversation is open. */
const ChatWindowEmptyState = () => {
  const translate = useChatTranslate();

  return (
    <div
      className="flex grow-1 flex-col items-center justify-center gap-small padding-large text-align-x-center"
      data-testid="react-chat-window-empty"
    >
      <Icon name="icon-regular-speech-bubble-round" size="XLarge" className="content-muted" />
      <span className="text-body-medium content-muted">
        {translate("Message.SelectChat", undefined, "Select a chat to start messaging")}
      </span>
    </div>
  );
};

export default ChatWindowEmptyState;
