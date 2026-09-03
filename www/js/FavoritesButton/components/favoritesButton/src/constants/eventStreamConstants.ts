import { parseEventParams } from '../utils/parsingUtils';

export const eventType = {
  favoriteButtonClicked: 'favoriteButtonClicked',
  favoriteButtonClickedType: 'buttonClicked'
} as const;

export type TEvent = [
  { name: string; type: string; context: string },
  Record<string, string | number>
];
export type TEventType = keyof typeof eventType;

export type TFavorite = {
  url: string;
};

export default {
  favoriteButtonClicked: (params: TFavorite, context: string): TEvent => [
    {
      name: eventType.favoriteButtonClicked,
      type: eventType.favoriteButtonClickedType,
      context
    },
    parseEventParams({
      ...params
    })
  ]
};
