import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, IconButton, TextInput } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useFriendsDirectory } from "../../hooks/useFriendsDirectory";
import { useChatMetadataConfig } from "../../hooks/useChatMetadataConfig";
import { getPresenceLabel } from "../../utils/chatPresenceLabels";
import AvatarHeadshot from "../AvatarHeadshot";

type TGroupInviteDialogProps = {
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string, participantIds: number[]) => void;
};

const MIN_SELECTED_FRIENDS_TO_CREATE = 2;
const CREATE_CHAT_HEADER_TRANSLATION_KEY = "Heading.NewChatGroup";

const GroupInviteDialog = ({
  isOpen,
  isSubmitting,
  onClose,
  onCreateGroup,
}: TGroupInviteDialogProps) => {
  const { translate } = useTranslation();
  const { groupInviteMemberCap, maxConversationTitleLength } = useChatMetadataConfig();
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const { friends: suggestedFriends } = useFriendsDirectory();
  const filteredFriends = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return suggestedFriends;
    }

    return suggestedFriends.filter(
      friend =>
        friend.displayName.toLowerCase().includes(normalizedSearchTerm) ||
        friend.username.toLowerCase().includes(normalizedSearchTerm),
    );
  }, [searchTerm, suggestedFriends]);
  const canCreateGroup = selectedFriendIds.length >= MIN_SELECTED_FRIENDS_TO_CREATE;
  const selectedFriendCountLabel = `(${selectedFriendIds.length}/${groupInviteMemberCap})`;

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setSearchTerm("");
      setSelectedFriendIds([]);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const toggleFriendSelection = (friendId: number) => {
    setSelectedFriendIds(currentSelectedFriendIds => {
      if (currentSelectedFriendIds.includes(friendId)) {
        return currentSelectedFriendIds.filter(selectedFriendId => selectedFriendId !== friendId);
      }

      if (currentSelectedFriendIds.length >= groupInviteMemberCap) {
        return currentSelectedFriendIds;
      }

      return [...currentSelectedFriendIds, friendId];
    });
  };

  return (
    <section
      className="react-chat-dialog-shell react-chat-top-radius flex width-[260px] height-[360px] pointer-events-auto flex-col overflow-hidden bg-surface-100 stroke-standard stroke-muted shadow-transient-high clip content-default"
      aria-label={translate(CREATE_CHAT_HEADER_TRANSLATION_KEY)}
    >
      <div className="react-chat-top-radius flex width-full shrink-0 items-center justify-between gap-small bg-surface-100 padding-x-small padding-y-small">
        <span className="min-width-none text-title-medium content-emphasis text-truncate-end">
          {translate(CREATE_CHAT_HEADER_TRANSLATION_KEY)}
        </span>
        <IconButton
          ariaLabel={translate("Action.Close")}
          icon="icon-regular-x"
          size="Small"
          variant="Utility"
          isCircular
          onClick={onClose}
        />
      </div>
      <div className="flex shrink-0 padding-x-small padding-bottom-small">
        <TextInput
          className="grow-1"
          value={groupName}
          onChange={event => {
            setGroupName(event.currentTarget.value.slice(0, maxConversationTitleLength));
          }}
          placeholder={translate("Label.NameYourChatGroup")}
          leadingIconName="icon-regular-person-plus"
          size="Small"
        />
      </div>
      <div className="flex shrink-0 padding-x-small padding-bottom-small">
        <TextInput
          className="grow-1"
          value={searchTerm}
          onChange={event => {
            setSearchTerm(event.currentTarget.value);
          }}
          placeholder={translate("Label.InputPlaceHolder.SearchForFriends")}
          leadingIconName="icon-filled-magnifying-glass"
          trailingIconNode={
            <span className="shrink-0 text-caption-medium content-muted">
              {selectedFriendCountLabel}
            </span>
          }
          size="Small"
        />
      </div>
      <div className="react-chat-create-friend-list flex min-height-0 grow-1 flex-col scroll-y">
        {filteredFriends.map(friend => {
          const isSelected = selectedFriendIds.includes(friend.id);

          return (
            <div
              key={friend.id}
              className="flex shrink-0 items-center gap-small padding-x-small padding-y-xsmall cursor-pointer hover:bg-shift-100"
            >
              <AvatarHeadshot
                userId={friend.id}
                displayName={friend.displayName}
                containerClassName="size-800 radius-circle bg-shift-300 clip"
              />
              <div className="min-width-none grow-1">
                <div className="text-body-medium content-emphasis text-truncate-end">
                  {friend.displayName}
                </div>
                <div className="text-caption-medium content-muted text-truncate-end">
                  {getPresenceLabel(friend.presence, translate)}
                </div>
              </div>
              <Checkbox
                label=""
                isChecked={isSelected}
                onCheckedChange={() => {
                  toggleFriendSelection(friend.id);
                }}
                placement="Start"
                size="Small"
              />
            </div>
          );
        })}
      </div>
      <div className="react-chat-details-action-footer flex shrink-0 gap-small bg-surface-100 padding-medium">
        <Button variant="Standard" size="Small" onClick={onClose}>
          {translate("Action.Cancel")}
        </Button>
        <Button
          variant="Emphasis"
          size="Small"
          isDisabled={!canCreateGroup || isSubmitting}
          onClick={() => {
            if (canCreateGroup && !isSubmitting) {
              onCreateGroup(groupName.trim(), selectedFriendIds);
            }
          }}
        >
          {translate("Action.Create")}
        </Button>
      </div>
    </section>
  );
};

export default GroupInviteDialog;
