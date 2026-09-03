import { parseEventParams } from '../utils/parsingUtils';

export const eventType = {
  avatarChanged: 'avatarChanged',
  tryOn: 'TryOn',
  itemDetailsPageClicked: 'itemDetailsPageClicked'
} as const;

export const eventCtx = {
  experienceLink: 'experienceLink'
};

export type TEvent = [
  { name: string; type: string; context: string },
  Record<string, string | number>
];
export type TEventType = keyof typeof eventType;

export type TTryOn = {
  wearAssetId: number;
  wearAssetTypeId: number;
  avatarChangeType: string;
};

export type TExperienceLinkClicked = {
  experienceId: string;
  itemId: number;
  itemType: string;
  collectiblesItemId: string | null;
};

export default {
  tryOn: (params: TTryOn): TEvent => [
    {
      name: eventType.avatarChanged,
      type: eventType.avatarChanged,
      context: eventType.tryOn
    },
    parseEventParams({
      ...params
    })
  ],
  experienceLinkClicked: (params: TExperienceLinkClicked): TEvent => [
    {
      name: eventType.itemDetailsPageClicked,
      type: eventType.itemDetailsPageClicked,
      context: eventCtx.experienceLink
    },
    parseEventParams({
      ...params
    })
  ]
};
