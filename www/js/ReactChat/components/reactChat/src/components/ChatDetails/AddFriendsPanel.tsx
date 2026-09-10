import { useMemo, useState } from "react";
import { Button, Checkbox, IconButton, TextInput } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useFriendsDirectory } from "../../hooks/useFriendsDirectory";
import { useChatMetadataConfig } from "../../hooks/useChatMetadataConfig";
import type { TChatConversation } from "../../types/chat";
import { getPresenceLabel } from "../../utils/chatPresenceLabels";
import AvatarHeadshot from "../AvatarHeadshot";

type TAddFriendsPanelProps = {
  conversation: TChatConversation;
  onBack: () => void;
  onClose: (layoutId: string) => void;
  onAddFriends: (conversationId: string, userIds: number[]) => void;
};

const AddFriendsPanel = ({
  conversation,
  onBack,
  onClose,
  onAddFriends,
}: TAddFriendsPanelProps) => {
  const { translate } = useTranslation();
  const { groupInviteMemberCap } = useChatMetadataConfig();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
  const { friends: allFriends } = useFriendsDirectory();
  // Slots left before the group hits its max, not a fixed number: cap − current members (participants
  // excludes self). Legacy computed the same (isNumberOfMemberOverloaded), so a near-full group can't
  // be pushed past the max.
  const remainingMemberSlots = Math.max(0, groupInviteMemberCap - conversation.participants.length);
  const existingParticipantIds = useMemo(
    () => new Set(conversation.participants.map(p => p.id)),
    [conversation.participants],
  );
  const suggestedFriends = useMemo(
    () => allFriends.filter(f => !existingParticipantIds.has(f.id)),
    [allFriends, existingParticipantIds],
  );
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
  // Re-validate against the live remaining slots too: if the group fills up (a member joins) while
  // this panel is open with a maxed selection, block Add rather than pushing past the max.
  const canAddFriends =
    selectedFriendIds.length > 0 && selectedFriendIds.length <= remainingMemberSlots;
  const selectedFriendCountLabel = `(${selectedFriendIds.length}/${remainingMemberSlots})`;

  const toggleFriendSelection = (friendId: number) => {
    setSelectedFriendIds(currentSelectedFriendIds => {
      if (currentSelectedFriendIds.includes(friendId)) {
        return currentSelectedFriendIds.filter(selectedFriendId => selectedFriendId !== friendId);
      }

      if (currentSelectedFriendIds.length >= remainingMemberSlots) {
        return currentSelectedFriendIds;
      }

      return [...currentSelectedFriendIds, friendId];
    });
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
          {translate("Label.AddFriends")}
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
      <div className="react-chat-details-scroll flex min-height-0 grow-1 flex-col scroll-y">
        {filteredFriends.map(friend => {
          const isSelected = selectedFriendIds.includes(friend.id);

          return (
            <div
              key={friend.id}
              className="react-chat-details-row flex shrink-0 items-center gap-small padding-x-medium padding-y-small cursor-pointer hover:bg-shift-100"
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
        <Button variant="Standard" size="Small" onClick={onBack}>
          {translate("Action.Cancel")}
        </Button>
        <Button
          variant="Emphasis"
          size="Small"
          isDisabled={!canAddFriends}
          onClick={() => {
            if (canAddFriends) {
              onAddFriends(conversation.id, selectedFriendIds);
              onBack();
            }
          }}
        >
          {translate("Action.Add")}
        </Button>
      </div>
    </div>
  );
};

export default AddFriendsPanel;
