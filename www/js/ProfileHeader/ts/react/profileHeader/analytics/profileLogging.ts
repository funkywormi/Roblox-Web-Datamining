import { EnvironmentUrls } from 'Roblox';
import { Tracker, Configuration, TrackerRequest } from '@rbx/event-stream';

const robloxSiteDomain = EnvironmentUrls.domain;

export enum ProfileEventType {
  PAGE_LOAD = 'pageLoad',
  BUTTON_CLICK = 'buttonClick'
}

const defaultConfiguration = new Configuration({
  baseUrl: `https://ecsv2.${robloxSiteDomain}/www`
});
const tracker = new Tracker(defaultConfiguration);

export interface TrackerClient {
  sendEvent(eventType: string, context: string, profileUserId: string): HTMLImageElement;
}

const trackerClient: TrackerClient = {
  sendEvent(eventType: ProfileEventType, context: string, profileUserId: string) {
    const request: TrackerRequest = {
      target: 'www',
      localTime: new Date(),
      eventType,
      context,
      additionalProperties: {
        profileUserId
      }
    };
    return tracker.sendEventViaImg(request);
  }
};

export default trackerClient;
