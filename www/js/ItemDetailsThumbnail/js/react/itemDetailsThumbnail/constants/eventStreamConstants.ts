import { parseEventParams } from '../utils/parsingUtils';

export const eventType = {
  avatarChanged: 'avatarChanged',
  tryOn: 'TryOn'
} as const;

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
  ]
};
