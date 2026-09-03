enum BlockUserError {
  InvalidTarget = 0,
  TargetAlreadyBlocked = 1,
  BlockLimitExceeded = 2,
  BlockingDisabled = 3,
  TargetNotBlocked = 4,
  UserUnblockable = 5,
  UserNotLoggedIn = 6,
  Invalid = 7,
  NoAuthenticatedUser = 8,
  NoBrowserTrackerId = 9,
  UserIdMismatch = 10,
  MissingRequesterUserId = 11,
  NotRccRequest = 12,
  UserCannotBlock = 13,
  ParentManaged = 14,
  NotLinked = 15,
  BlockedOnPlatform = 16
}

export default BlockUserError;
