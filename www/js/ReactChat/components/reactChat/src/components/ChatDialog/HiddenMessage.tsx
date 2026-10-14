import { Icon } from "@rbx/foundation-ui";
import useChatTranslate from "../../hooks/useChatTranslate";

/**
 * App Chat parity (`HiddenMessage.lua`): a message the server withheld from this viewer (age check,
 * age band, chat settings, ...) shows as a fixed-size incoming bubble with a muted lock icon and a
 * caption below it. It is a static placeholder: no text, no actions, and never any message content.
 */
const HiddenMessage = () => {
  const translate = useChatTranslate();

  return (
    <div data-testid="react-chat-hidden-message" className="flex flex-col items-start gap-small">
      <div className="react-chat-message-bubble react-chat-message-bubble-incoming flex width-[180px] height-[40px] items-center justify-center">
        <Icon
          data-testid="react-chat-hidden-message-icon"
          className="content-muted"
          name="icon-regular-lock-closed"
          size="Medium"
          aria-hidden="true"
        />
      </div>
      <span className="text-caption-small content-muted padding-x-small">
        {translate("Label.MessageNotAvailable", undefined, "This message is not available")}
      </span>
    </div>
  );
};

export default HiddenMessage;
