const profileHeaderContainer = (): HTMLElement | null =>
  document.getElementById('profile-header-container');

const translationKeys = {
  friends: 'Label.Friends',
  connections: 'Label.Connections',
  connection: 'Label.Connection',
  followers: 'Label.Followers',
  following: 'Label.Following',
  customizeName: 'Label.CustomizeName',
  cancel: 'Label.Cancel',
  setCustomName: 'Description.SetCustomName2',
  recognizeFriends: 'Description.RecognizeConnectionsByCustomName',
  save: 'Action.Save',
  customizeNamePlaceholder: 'Label.CustomizeNamePlaceholder',
  invalidAlias: 'Message.InvalidAliasError',
  buttons: {
    accept: 'Action.Accept',
    addConnection: 'Label.AddConnection',
    pending: 'Action.Pending',
    removeConnection: 'Label.RemoveConnection',
    chat: 'Action.Chat',
    joinGame: 'Action.JoinGame',
    openDropdown: 'Action.SeeMore'
  },
  modal: {
    block: {
      title: 'Heading.BlockUser',
      body: 'Message.BlockConfirmation',
      blockButton: 'Action.Block',
      blockAndReportButton: 'Action.BlockAndReport',
      cancelButton: 'Action.Cancel'
    },
    unblock: {
      title: 'Heading.UnblockUser',
      body: 'Message.UnblockConfirmation',
      unblockButton: 'Action.Unblock',
      cancelButton: 'Action.Cancel'
    }
  },
  dropdown: {
    follow: 'Action.Follow',
    unfollow: 'Action.Unfollow',
    blockUser: 'Action.BlockUser',
    unblockUser: 'Action.UnblockUser',
    inventory: 'Action.Inventory',
    favorites: 'Action.Favorites',
    impersonateUser: 'Action.ImpersonateUser',
    tradeItems: 'Action.TradeItems',
    reportAbuse: 'Label.ReportAbuse'
  },
  error: {
    acceptFriendRequestFailed: 'Message.AcceptFriendRequestError',
    sendFriendRequestFailed: 'Message.SendFriendRequestError',
    sendConnectionRequestFailed: 'Message.SendConnectionRequestError',
    removeFriendFailed: 'Message.RemoveFriendError',
    followFailed: 'Message.FollowError',
    unfollowFailed: 'Message.UnfollowError',
    blockFailed: 'Message.BlockError',
    blockRequestFailed: 'Message.BlockRequestError',
    impersonateUserFailed: 'Message.ImpersonateUserError',
    updateStatusFailed: 'Message.UpdateStatusError',
    tooManyAttempts: 'Response.TooManyAttempts',
    blockLimitExceeded: 'Message.TooManyBlockedUsersError',
    targetAlreadyBlocked: 'Message.UserAlreadyBlockedError',
    targetNotBlocked: 'Message.TargetNotBlockedError',
    parentManaged: 'Message.ParentBlockedUserError',
    blockedOnPlatform: 'Message.TargetBlockedOnPlatform'
  }
};

const eventNames = {
  playerFriendAdd: 'playerFriendAdd',
  playerFriendAccept: 'playerFriendAccept',
  tradeEntryPoint: 'tradeEntryPoint',
  modalOpen: 'modalOpen',
  buttonClick: 'buttonClick',
  customNameInvalidInput: 'customizeNameSaveAttemptInvalidInput',
  customNameMaxLimit: 'customizeNameMaximumCharLimitTyped',
  customNameClearedInput: 'customizeNameClearedInput'
};

const maxCharactersForAlias = 20;

const eventCtx = {
  userProfile: 'userProfile',
  profileMenu: 'profileMenu',
  customizeName: 'customizeName'
};

const eventBtns = {
  saveAlias: 'saveAlias',
  closeCustomName: 'closeCustomizeName'
};

const experiments = {
  profileFRAcceptCTALayer: 'Social.Profile',
  profileFRAcceptCTAParameter: 'useProminentFRAcceptCTA'
};

export default {
  profileHeaderContainer,
  translationKeys,
  eventNames,
  eventCtx,
  maxCharactersForAlias,
  eventBtns,
  experiments
};
