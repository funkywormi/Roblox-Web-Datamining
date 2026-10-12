import { useEffect, useRef, useState } from "react";
import { Button, IconButton, TextArea } from "@rbx/foundation-ui";
import useChatTranslate from "../../hooks/useChatTranslate";
import { useChatMetadataConfig } from "../../hooks/useChatMetadataConfig";
import type { TChatConversation, TRenameResult } from "../../types/chat";

/**
 * A rename that did not happen. The panel stays open and tells the user why. Like App Chat, the
 * message stays while the user edits the name, so a failure keeps the names from its own attempt.
 */
type TRenameFailure =
  | { kind: "moderated" }
  | { kind: "failed"; existingName: string; attemptedName: string };

type TChatGroupNamePanelProps = {
  conversation: TChatConversation;
  onBack: () => void;
  onClose: (layoutId: string) => void;
  onRenameConversation: (layoutId: string, title: string) => Promise<TRenameResult>;
};

const ChatGroupNamePanel = ({
  conversation,
  onBack,
  onClose,
  onRenameConversation,
}: TChatGroupNamePanelProps) => {
  const translate = useChatTranslate();
  const { maxConversationTitleLength } = useChatMetadataConfig();
  const [groupName, setGroupName] = useState(conversation.title);
  const trimmedGroupName = groupName.trim();
  const canSave = trimmedGroupName.length > 0;
  const groupNameLengthLabel = `${groupName.length}/${maxConversationTitleLength}`;
  const [isSaving, setIsSaving] = useState(false);
  const [renameFailure, setRenameFailure] = useState<TRenameFailure | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const saveGroupName = async () => {
    if (!canSave || isSaving) {
      return;
    }

    setIsSaving(true);
    // Like App Chat, the message goes away when the next request starts.
    setRenameFailure(null);
    const attemptedName = trimmedGroupName;
    const result = await onRenameConversation(conversation.layoutId, attemptedName);
    if (!isMountedRef.current) {
      return;
    }

    setIsSaving(false);
    if (result === "success") {
      onBack();
      return;
    }
    // A blocked or failed rename keeps the panel open so the user sees why and can try again.
    setRenameFailure(
      result === "moderated"
        ? { kind: "moderated" }
        : { kind: "failed", existingName: conversation.title, attemptedName },
    );
  };

  // English fallbacks until the strings have the WebFrontend consumer in Translations Hub.
  const getRenameFailureText = (failure: TRenameFailure) =>
    failure.kind === "moderated"
      ? translate("Response.ChatNameFullyModerated.V2", undefined, "Group name was moderated.")
      : translate(
          "Message.FailedToRenameConversation.V2",
          { EXISTING_NAME: failure.existingName, NEW_NAME: failure.attemptedName },
          `The group ${failure.existingName} could not be renamed to ${failure.attemptedName}.`,
        );

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
          {renameFailure !== null && (
            <span role="alert" className="text-caption-medium content-system-alert">
              {getRenameFailureText(renameFailure)}
            </span>
          )}
        </div>
      </div>
      <div className="react-chat-group-name-editor-footer flex shrink-0 gap-small bg-surface-100 padding-medium">
        <Button variant="Standard" size="Small" onClick={onBack}>
          {translate("Action.Cancel")}
        </Button>
        <Button
          variant="Emphasis"
          size="Small"
          isDisabled={!canSave || isSaving}
          onClick={() => {
            saveGroupName().catch(() => undefined);
          }}
        >
          {translate("Action.Save")}
        </Button>
      </div>
    </div>
  );
};

export default ChatGroupNamePanel;
