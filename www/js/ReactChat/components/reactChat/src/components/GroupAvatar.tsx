import classNames from "classnames";
import type { TChatParticipant } from "../types/chat";
import AvatarHeadshot from "./AvatarHeadshot";

const GROUP_AVATAR_MAX = 4;

type TGroupAvatarProps = {
  participants: TChatParticipant[];
  /** Outer-circle classes (size, radius, background, stroke) supplied by the caller. */
  containerClassName?: string;
};

// Group-conversation avatar, matching the legacy web chat's shared avatar-group: members' headshots
// are cropped into one circle and arranged by count — two side-by-side halves for a pair, one
// full-height plus two stacked for three, a 2x2 grid for four or more.
const GroupAvatar = ({ participants, containerClassName }: TGroupAvatarProps) => {
  const shownParticipants = participants.slice(0, GROUP_AVATAR_MAX);

  let layoutClass = "react-chat-avatar-group-quad";
  if (shownParticipants.length <= 1) {
    layoutClass = "react-chat-avatar-group-single";
  } else if (shownParticipants.length === 2) {
    layoutClass = "react-chat-avatar-group-double";
  } else if (shownParticipants.length === 3) {
    layoutClass = "react-chat-avatar-group-triple";
  }

  return (
    <div
      className={classNames("react-chat-avatar-group", layoutClass, containerClassName)}
      data-testid="react-chat-group-avatar"
    >
      {shownParticipants.map(participant => (
        <AvatarHeadshot
          key={participant.id}
          userId={participant.id}
          displayName={participant.displayName}
          containerClassName="react-chat-avatar-group-image bg-shift-300"
        />
      ))}
    </div>
  );
};

export default GroupAvatar;
