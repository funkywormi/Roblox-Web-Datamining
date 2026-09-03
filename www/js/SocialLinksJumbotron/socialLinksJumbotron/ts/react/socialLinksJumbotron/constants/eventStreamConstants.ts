import { eventStreamService } from 'core-roblox-utilities';
import { parseEventParams } from '@rbx/unified-logging';

const { eventTypes } = eventStreamService;

type TEvent = {
  name: string;
  type: string;
  context: string;
};

type TSocialLinkClickEventParams = {
  assignmentId: number;
  assignmentType: string;
  socialLinkType: string;
  socialLinkUrl: string;
  socialLinkDisplayType: string;
};

type TEdpSocialLinksImpressionsParams = {
  itemPositions: number[];
  socialLinkUrls: string[];
  socialLinkTypes: string[];
  socialLinkDisplayType: string;
  assignmentType: string;
  assignmentId: number;
  page: string;
};

export default {
  socialLinkClickEvent: (
    eventParams: TSocialLinkClickEventParams
  ): [TEvent, Record<string, string | number>] => [
    {
      name: 'socialLinkClickEvent',
      type: 'socialLinkClickEvent',
      context: eventTypes.formInteraction
    },
    parseEventParams(eventParams)
  ],
  edpSocialLinksImpressions: (
    eventParams: TEdpSocialLinksImpressionsParams
  ): [TEvent, Record<string, string | number>] => [
    {
      name: 'EdpSocialLinksImpressions',
      type: 'EdpSocialLinksImpressions',
      context: eventTypes.formInteraction
    },
    parseEventParams(eventParams)
  ]
};
