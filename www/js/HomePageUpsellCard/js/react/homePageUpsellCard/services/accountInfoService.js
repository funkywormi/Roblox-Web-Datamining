import { Guac } from 'Roblox';
import { httpService } from 'core-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import {
  getUpsellCardTypeUrlConfig,
  getDismissUpsellCardUrlConfig
} from '../constants/urlConstants';
import { UpsellCardEventContext } from '../constants/upsellCardConstants';

export const getHomePageUpsellCardVariation = () => {
  const urlConfig = getUpsellCardTypeUrlConfig();
  return httpService.get(urlConfig).then(({ data }) => {
    return data;
  });
};

export const getVoicePolicy = async () => {
  const data = await Guac.callBehaviour('free-communication-infographics');
  return data;
};

export const sendEvent = (event, origin, cardType, section, btn = undefined) => {
  eventStreamService.sendEventWithTarget(event.type, UpsellCardEventContext[cardType], {
    ...event.params,
    origin,
    section,
    btn
  });
};

export const recordDismiss = cardType => {
  const urlConfig = getDismissUpsellCardUrlConfig();
  return httpService.post(urlConfig, { cardType }).then(({ data }) => {
    return data;
  });
};
