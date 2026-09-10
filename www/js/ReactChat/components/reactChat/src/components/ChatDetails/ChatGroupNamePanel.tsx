import { useState } from "react";
import { Button, IconButton, TextArea } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useChatMetadataConfig } from "../../hooks/useChatMetadataConfig";
import type { TChatConversation } from "../../types/chat";

type TChatGroupNamePanelProps = {
  conversation: TChatConversation;
  onBack: () => void;
  onClose: (layoutId: string) => void;
  onRenameConversation: (layoutId: string, title: string) => void;
};

const ChatGroupNamePanel = ({
  conversation,
  onBack,
  onClose,
  onRenameConversation,
}: TChatGroupNamePanelProps) => {
  const { translate } = useTranslation();
  const { maxConversationTitleLength } = useChatMetadataConfig();
  const [groupName, setGroupName] = useState(conversation.title);
  const trimmedGroupName = groupName.trim();
  const canSave = trimmedGroupName.length > 0;
  const groupNameLengthLabel = `${groupName.length}/${maxConversationTitleLength}`;

  const saveGroupName = () => {
    if (!canSave) {
      return;
    }

    onRenameConversation(conversation.layoutId, trimmedGroupName);
    onBack();
  };

  return (
    <div className="flex min-height-0 grow-1 flex-col">
      <div className="react-chat-top-radius flex width-full shrink-0 items-center gap-small bg-surface-100 padding-x-small padding-y-small">
        <IconButton
          ariaLabel={translate("Action.Back")}
          icon="icon-regular-chevron-large-left"
          size="Small"
          variant="Utility"
          isCircular
          onClick={onBack}
        />
        <span className="min-width-none grow-1 text-title-medium content-emphasis text-truncate-end">
          {translate("Label.ChatGroupName")}
        </span>
        <IconButton
          ariaLabel={translate("Action.Close")}
          icon="icon-regular-x"
          size="Small"
          variant="Utility"
          isCircular
          onClick={() => {
            onClose(conversation.layoutId);
          }}
        />
      </div>
      <div className="react-chat-group-name-editor flex min-height-0 grow-1 flex-col bg-surface-100 padding-medium">
        <div className="text-body-medium content-muted">
          {translate("Label.ChangeChatGroupName")}
        </div>
        <div className="flex flex-col gap-xsmall">
          <TextArea
            value={groupName}
            onChange={event => {
              setGroupName(event.currentTarget.value.slice(0, maxConversationTitleLength));
            }}
            rows={1}
            size="Small"
            textareaClassName="react-chat-group-name-editor-textarea width-full"
            aria-label={translate("Label.ChatGroupName")}
          />
          <span className="react-chat-group-name-editor-count text-caption-medium content-muted">
            {groupNameLengthLabel}
          </span>
        </div>
      </div>
      <div className="react-chat-group-name-editor-footer flex shrink-0 gap-small bg-surface-100 padding-medium">
        <Button variant="Standard" size="Small" onClick={onBack}>
          {translate("Action.Cancel")}
        </Button>
        <Button variant="Emphasis" size="Small" isDisabled={!canSave} onClick={saveGroupName}>
          {translate("Action.Save")}
        </Button>
      </div>
    </div>
  );
};

export default ChatGroupNamePanel;
