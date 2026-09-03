import { eventStreamService } from "core-roblox-utilities";
import { getEventParams } from "../../constants/eventConstants";
import wrapEventServiceWithTryCatch from "../../../../core/utils/eventUtils";

const contactImportEventService = {
  privacyTabPageView: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.privacyTabPageView();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  deleteContactsSuccess: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.deleteContactsSuccess();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  toggleSyncContacts: wrapEventServiceWithTryCatch((access: boolean): void => {
    const params = getEventParams.toggleSyncContacts(access);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
};

export default contactImportEventService;
