import { eventStreamService } from "core-roblox-utilities";
import { getEventParams } from "../../constants/eventConstants";
import wrapEventServiceWithTryCatch from "../../../../core/utils/eventUtils";

// Every reporter is a no-op for subscribers, matching the Lua app's
// robloxPlusThemeAnalytics, so these tables hold only the upsell population.
const appThemeEventService = {
  upsellBannerShown: wrapEventServiceWithTryCatch((isSubscriber: boolean): void => {
    if (isSubscriber) {
      return;
    }
    const params = getEventParams.appThemeUpsellBannerShown();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  upsellSubscribeClick: wrapEventServiceWithTryCatch((isSubscriber: boolean): void => {
    if (isSubscriber) {
      return;
    }
    const params = getEventParams.appThemeUpsellSubscribeClick();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  themeSelected: wrapEventServiceWithTryCatch((isSubscriber: boolean, themeKey: string): void => {
    if (isSubscriber) {
      return;
    }
    const params = getEventParams.appThemeSelected(themeKey);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  devicePreferencesExit: wrapEventServiceWithTryCatch((isSubscriber: boolean): void => {
    if (isSubscriber) {
      return;
    }
    const params = getEventParams.devicePreferencesExit();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
};

export default appThemeEventService;
