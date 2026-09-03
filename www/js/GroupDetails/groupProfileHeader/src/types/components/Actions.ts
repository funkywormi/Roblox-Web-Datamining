export enum Action {
  EditProfile = 'EditProfile',
  QrCode = 'QrCode',
  Chat = 'Chat',
  JoinExperience = 'JoinExperience',
  Block = 'Block',
  Unblock = 'Unblock',
  AddFriend = 'AddFriend',
  Unfriend = 'Unfriend',
  AcceptFriendRequest = 'AcceptFriendRequest',
  PendingFriendRequest = 'PendingFriendRequest',
  IgnoreFriendRequest = 'IgnoreFriendRequest',
  CannotAddFriend = 'CannotAddFriend',
  AcceptOffNetworkFriendRequest = 'AcceptOffNetworkFriendRequest',
  AddFriendFromContacts = 'AddFriendFromContacts',
  AddFriendFromContactsSent = 'AddFriendFromContactsSent',
  Follow = 'Follow',
  Unfollow = 'Unfollow',
  EditAlias = 'EditAlias',
  Report = 'Report',
  JoinCommunity = 'JoinCommunity',
  CancelJoinCommunityRequest = 'CancelJoinCommunityRequest',
  ViewCommunity = 'ViewCommunity',
  ViewFullProfile = 'ViewFullProfile',
  CopyLink = 'CopyLink',
  LeaveCommunity = 'LeaveCommunity',
  MakePrimaryCommunity = 'MakePrimaryCommunity',
  RemovePrimaryCommunity = 'RemovePrimaryCommunity',
  ShareProfile = 'ShareProfile',
  ConfigureCommunity = 'ConfigureCommunity',
  ClaimCommunityOwnership = 'ClaimCommunityOwnership',
  ChangeCommunityOwner = 'ChangeCommunityOwner',
  ViewInventory = 'ViewInventory',
  ViewFavorites = 'ViewFavorites',
  TradeItems = 'TradeItems',
  ImpersonateUser = 'ImpersonateUser',
  EditAvatar = 'EditAvatar',
  AddIncomingTrustedConnection = 'AddIncomingTrustedConnection',
  RemoveTrustedConnection = 'RemoveTrustedConnection',
  CurrencyTransfer = 'CurrencyTransfer'
}

export interface TypedAction {
  type: Action;
  disabledReason?: DisabledReason;
  subActions?: Action[] | Action[][];
}

export interface Actions {
  primary?: Action;
  secondary?: Action[];
  contextual?: Action[] | Action[][];
  buttons?: TypedAction[];
}

export enum DisabledReason {
  BannedFromCommunity = 'BannedFromCommunity',
  CommunityIsClosed = 'CommunityIsClosed',
  MaxCommunitiesJoined = 'MaxCommunitiesJoined',
  InsufficientVerificationLevelLow = 'InsufficientVerificationLevelLow',
  InsufficientVerificationLevelMedium = 'InsufficientVerificationLevelMedium',
  InsufficientVerificationLevelHigh = 'InsufficientVerificationLevelHigh',
  AccountCreatedLessThanOneDay = 'AccountCreatedLessThanOneDay',
  AccountCreatedLessThanThreeDays = 'AccountCreatedLessThanThreeDays',
  AccountCreatedLessThanOneWeek = 'AccountCreatedLessThanOneWeek',
  AccountCreatedLessThanOneMonth = 'AccountCreatedLessThanOneMonth',
  AccountCreatedLessThanThreeMonths = 'AccountCreatedLessThanThreeMonths',
  AlwaysDisabled = 'AlwaysDisabled',
  BlockedByProfileOwner = 'BlockedByProfileOwner',
  DeletedProfile = 'DeletedProfile'
}
