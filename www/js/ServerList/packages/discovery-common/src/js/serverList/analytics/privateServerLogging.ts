import environmentUrls from "@rbx/environment-urls";
import { Tracker, Configuration, TrackerRequest } from "@rbx/event-stream";
import { PrivateServerEventType } from "./privateServerEventTypes";

export { PrivateServerEventType, PrivateServerEventContext } from "./privateServerEventTypes";

const robloxSiteDomain = environmentUrls.domain;

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
