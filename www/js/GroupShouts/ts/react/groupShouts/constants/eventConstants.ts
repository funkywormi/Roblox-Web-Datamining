export enum EventType {
  CommunityDialogStateChanged = 'communityDialogStateChanged'
}

export enum EventContext {
  NotificationBell = 'notificationBell',
  NotificationUpsell = 'notificationUpsell'
}

export enum EventDialogType {
  Create = 'create',
  Link = 'link',
  ChangeChannel = 'changeChannel',
  Unlink = 'unlink'
}

export enum EventDialogState {
  Started = 'started',
  Completed = 'completed'
}

export enum EventEntityType {
  Group = 'group'
}
