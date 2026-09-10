import classNames from "classnames";
import React, { useState } from "react";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  MenuSection,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { getCurrentUserId } from "../../utils/currentUser";
import type { TChatConversation, TDialogScreen } from "../../types/chat";
import { getPresenceLabel } from "../../utils/chatPresenceLabels";
import { presenceDotClassByType } from "../../utils/presenceStyles";
import AvatarHeadshot from "../AvatarHeadshot";
import GroupAvatar from "../GroupAvatar";
import AddFriendsPanel from "./AddFriendsPanel";
import ChatGroupNamePanel from "./ChatGroupNamePanel";

// Re-exported for callers/tests that import the revamp report URL from this module. The
// implementation (and the legacy fallback + navigation) lives in utils/abuseReport.
export { getReportUrl } from "../../utils/abuseReport";

type TChatDetailsProps = {
  conversation: TChatConversation;
  onClose: (layoutId: string) => void;
  onLeaveGroupConversation: (layoutId: string) => void;
  onRenameConversation: (layoutId: string, title: string) => void;
  onAddFriends: (conversationId: string, userIds: number[]) => void;
  onRemoveParticipant: (conversationId: string, userId: number) => void;
  onSetScreen: (layoutId: string, screen: TDialogScreen) => void;
  onReportParticipant: (layoutId: string, participantId: number) => void;
};

const ChatDetails = ({
  conversation,
  onClose,
  onLeaveGroupConversation,
  onRenameConversation,
  onAddFriends,
  onRemoveParticipant,
  onSetScreen,
  onReportParticipant,
}: TChatDetailsProps) => {
  const { translate } = useTranslation();
  const [isAddingFriends, setIsAddingFriends] = useState(false);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [menuParticipantId, setMenuParticipantId] = useState<number | null>(null);

  // Only the group's creator may remove other members (parity with the legacy
  // canConversationRemoveMember gate). `participants` already exclude the local user, so
  // every rendered row is someone the owner can remove — i.e. "anyone but themselves".
  const currentUserId = getCurrentUserId();
  const canRemoveMembers =
    conversation.dialogType === "Group" &&
    currentUserId != null &&
    conversation.createdBy === currentUserId &&
    !conversation.isUserPending;

  if (isAddingFriends) {
    return (
      <AddFriendsPanel
        conversation={conversation}
        onBack={() => {
          setIsAddingFriends(false);
        }}
        onClose={onClose}
        onAddFriends={onAddFriends}
      />
    );
  }

  if (isEditingGroupName) {
    return (
      <ChatGroupNamePanel
        conversation={conversation}
        onBack={() => {
          setIsEditingGroupName(false);
        }}
        onClose={onClose}
        onRenameConversation={onRenameConversation}
      />
    );
  }

  return (
    <div className="flex min-height-0 grow-1 flex-col">
      <div className="react-chat-top-radius flex width-full shrink-0 items-center gap-small bg-surface-100 padding-x-small padding-y-small">
        <IconButton
          ariaLabel={translate("Action.Back")}
          icon="icon-regular-chevron-large-left"
          size="Small"
          variant="Utility"
          isCircular
          onClick={() => {
            onSetScreen(conversation.layoutId, "Default");
          }}
        />
        <span className="min-width-none grow-1 text-title-medium content-emphasis text-truncate-end">
          {translate("Label.ChatDetails")}
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
      <div className="react-chat-details-scroll flex min-height-0 grow-1 flex-col scroll-y">
        {conversation.dialogType === "Group" && (
          <React.Fragment>
            <div className="react-chat-details-section-label text-caption-medium content-muted">
              {translate("Label.General")}
            </div>
            <button
              type="button"
              aria-label={translate("Label.ChatGroupName")}
              className="react-chat-details-row flex width-full shrink-0 items-center gap-small bg-none stroke-none padding-x-small padding-y-small text-left cursor-pointer hover:bg-shift-100"
              onClick={() => {
                setIsEditingGroupName(true);
              }}
            >
              <GroupAvatar
                participants={conversation.participants}
                containerClassName="react-chat-details-group-avatar shrink-0 radius-circle bg-shift-300"
              />
              <span className="min-width-none grow-1 text-body-medium content-emphasis text-truncate-end">
                {conversation.title}
              </span>
              <span className="icon icon-regular-chevron-large-right size-400 shrink-0 content-muted" />
            </button>
          </React.Fragment>
        )}
        <div className="react-chat-details-section-label text-caption-medium content-muted">
          {translate("Label.Members")}
        </div>
        {conversation.dialogType === "Group" && (
          <button
            type="button"
            className="react-chat-details-row flex width-full shrink-0 items-center gap-small bg-none stroke-none padding-x-small padding-y-small text-left cursor-pointer hover:bg-shift-100"
            onClick={() => {
              setIsAddingFriends(true);
            }}
          >
            <span className="react-chat-details-add-icon flex shrink-0 items-center justify-center radius-circle stroke-standard stroke-muted content-emphasis">
              <span className="icon icon-regular-plus-large size-500" />
            </span>
            <span className="text-body-medium content-emphasis">
              {translate("Label.AddFriends")}
            </span>
          </button>
        )}
        {conversation.participants.map(participant => (
          <div
            key={participant.id}
            className="react-chat-details-row relative flex shrink-0 items-center gap-small padding-x-small padding-y-small"
          >
            <span className="relative shrink-0">
              <AvatarHeadshot
                userId={participant.id}
                displayName={participant.displayName}
                containerClassName="size-800 radius-circle bg-shift-300 clip"
              />
              {participant.presence !== "Offline" && (
                <span
                  className={classNames(
                    "react-chat-dialog-presence-dot absolute radius-circle stroke-standard",
                    presenceDotClassByType[participant.presence],
                  )}
                />
              )}
            </span>
            <div className="min-width-none grow-1">
              <div className="text-body-medium content-emphasis text-truncate-end">
                {participant.displayName}
              </div>
              <div className="text-caption-medium content-muted text-truncate-end">
                {getPresenceLabel(participant.presence, translate)}
              </div>
            </div>
            <Popover
              open={menuParticipantId === participant.id}
              onOpenChange={isOpen => {
                setMenuParticipantId(isOpen ? participant.id : null);
              }}
            >
              <PopoverTrigger asChild>
                <IconButton
                  ariaLabel={translate("Label.ChatDetails")}
                  icon="icon-filled-three-dots-horizontal"
                  size="Small"
                  variant="Utility"
                  isCircular
                />
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" ariaLabel={translate("Label.ChatDetails")}>
                <Menu size="Medium">
                  <MenuSection>
                    <MenuItem
                      value="view-profile"
                      title={translate("Label.ViewProfile")}
                      as="a"
                      href={participant.profileUrl}
                      onSelect={() => {
                        setMenuParticipantId(null);
                      }}
                    />
                    <MenuItem
                      value="report"
                      title={translate("Action.Report")}
                      as="button"
                      onSelect={() => {
                        setMenuParticipantId(null);
                        onReportParticipant(conversation.layoutId, participant.id);
                      }}
                    />
                    {canRemoveMembers && (
                      <MenuItem
                        value="remove-member"
                        title={translate("Action.Remove")}
                        as="button"
                        onSelect={() => {
                          setMenuParticipantId(null);
                          onRemoveParticipant(conversation.id, participant.id);
                        }}
                      />
                    )}
                  </MenuSection>
                </Menu>
              </PopoverContent>
            </Popover>
          </div>
        ))}
        {conversation.dialogType === "Group" && (
          <div className="react-chat-details-leave-button flex shrink-0 bg-surface-100 padding-medium">
            <Button
              variant="Standard"
              size="Medium"
              onClick={() => {
                onLeaveGroupConversation(conversation.layoutId);
              }}
            >
              {translate("Label.LeaveChatGroup")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDetails;
