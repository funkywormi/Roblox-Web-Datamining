import * as http from "@rbx/core-scripts/http";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import {
  getUpsellCardTypeUrlConfig,
  getDismissUpsellCardUrlConfig,
} from "../constants/urlConstants";
import { UpsellCardEventContext } from "../constants/upsellCardConstants";

export const getHomePageUpsellCardVariation = () => {
  const urlConfig = getUpsellCardTypeUrlConfig();
  return http.get(urlConfig).then(({ data }) => {
    return data;
  });
};

export const getVoicePolicy = async () => {
  const data = await callBehaviour("free-communication-infographics");
  return data;
};

export const sendEvent = (event, origin, cardType, section, btn = undefined) => {
  sendEventWithTarget(event.type, UpsellCardEventContext[cardType], {
    ...event.params,
    origin,
    section,
    btn,
  });
};

export const recordDismiss = cardType => {
  const urlConfig = getDismissUpsellCardUrlConfig();
  return http.post(urlConfig, { cardType }).then(({ data }) => {
    return data;
  });
};
