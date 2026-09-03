import { eventStreamService } from "core-roblox-utilities";
import { TUpdateUserSettingValueRequest } from "@rbx/user-settings";
import { btnClickEvent, getEventParams } from "../../constants/eventConstants";
import wrapEventServiceWithTryCatch from "../../../../core/utils/eventUtils";

const eventService = {
  btnClicked: wrapEventServiceWithTryCatch((btn: string): void => {
    const params = btnClickEvent(btn);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  voiceInfographicDisplayed: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.voiceInfographicDisplayed();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  avatarInfographicDisplayed: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.avatarInfographicDisplayed();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  voiceOptInToggleRequested: wrapEventServiceWithTryCatch((requestedOptInStatus: boolean): void => {
    const params = getEventParams.voiceOptInToggleRequested(requestedOptInStatus);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsUpdateAttempt: wrapEventServiceWithTryCatch(
    (request: TUpdateUserSettingValueRequest): void => {
      const params = getEventParams.authButtonClickSettingsUpdateAttempt(request);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
};

export default eventService;
