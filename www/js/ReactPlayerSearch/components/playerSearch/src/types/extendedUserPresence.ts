export const userPresenceTypes = {
  offline: 0,
  online: 1,
  game: 2,
  studio: 3,
  invisible: 4,
} as const;

export type UserPresenceType = (typeof userPresenceTypes)[keyof typeof userPresenceTypes];

export type ExtendedUserPresence = {
  userId: number;
  userPresenceType: number;
  lastLocation: string;
  universeId?: number;
  placeId?: number;
  gameId?: string;
  rootPlaceId?: number;
  gameIsPlayable: boolean;
};
