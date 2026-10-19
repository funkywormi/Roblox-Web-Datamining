/* eslint-disable @typescript-eslint/naming-convention -- member names are public API */
enum FriendInviteStatus {
  VALID = "Valid",
  EXPIRED = "Expired",
  CONSUMED = "Consumed",
  SENDER_BLOCKED_RECIPIENT = "SenderBlockedRecipient",
  INVALID = "Invalid",
}

export default FriendInviteStatus;
