import environmentUrls from "@rbx/environment-urls";
import { Tracker, Configuration, TrackerRequest } from "@rbx/event-stream";

const robloxSiteDomain = environmentUrls.domain;

export enum PrivateServerEventType {
  PRIVATE_SERVER_JOIN = "privateServerJoin",
  PRIVATE_SERVER_LOAD = "privateServerLoad",
  PRIVATE_SERVER_PLUS_UPSELL = "privateServerPlusUpsell",
}

export enum PrivateServerEventContext {
  GAME_TAB = "gameTab",
  PLUS_UPSELL_FREE_WITH_PLUS_CLICK = "plusUpsellFreeWithPlusClick",
  PLUS_UPSELL_SUBSCRIBE_BANNER_CLICK = "plusUpsellSubscribeBannerClick",
  PLUS_UPSELL_SUBSCRIBE_SHEET_CLICK = "plusUpsellSubscribeSheetClick",
  PLUS_UPSELL_SHEET_DISMISS = "plusUpsellSheetDismiss",
}

const defaultConfiguration = new Configuration({
  baseUrl: `https://ecsv2.${robloxSiteDomain}/www`,
});
const tracker = new Tracker(defaultConfiguration);

export interface TrackerClient {
  sendEvent(eventType: string, context: string, profileUserId: string): HTMLImageElement;
}

const trackerClient: TrackerClient = {
  sendEvent(eventType: PrivateServerEventType, context: string, latency: string) {
    const request: TrackerRequest = {
      target: "www",
      localTime: new Date(),
      eventType,
      context,
      additionalProperties: {
        latency,
      },
    };
    return tracker.sendEventViaImg(request);
  },
};

export default trackerClient;
