import { eventStreamService } from "core-roblox-utilities";
import RouterPath from "../../../../enums/RouterPath";
import { getEventParams } from "../../constants/eventConstants";
import wrapEventServiceWithTryCatch from "../../../../core/utils/eventUtils";

const settingsTabEventService = {
  authPageloadSettingsTab: wrapEventServiceWithTryCatch(
    (tabId: RouterPath, state: string): void => {
      const params = getEventParams.authPageloadSettingsTab(tabId, state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
};

export default settingsTabEventService;
