export enum TrustedFriendModalType {
  AddTrustedFriendsModal = 'AddTrustedFriendsModal',
  ExpiredLinkModal = 'ExpiredLinkModal',
  InvalidLinkModal = 'InvalidLinkModal'
}

export interface TrustedFriendModal {
  friendRequestTokens: number[];
  trustedFriendModalType: TrustedFriendModalType;
}
