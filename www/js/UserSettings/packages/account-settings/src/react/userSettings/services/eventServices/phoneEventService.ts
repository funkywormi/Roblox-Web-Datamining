import { eventStreamService } from "core-roblox-utilities";
import { TError } from "../../../../types/commonTypes";
import { phoneVerificationEvents, getEventParams } from "../../constants/eventConstants";
import errorHandler from "../../../../core/utils/errorHandlingUtils";
import wrapEventServiceWithTryCatch from "../../../../core/utils/eventUtils";

const phoneEventService = {
  modalPhoneChanged: wrapEventServiceWithTryCatch((btn: string, section: string): void => {
    const params = phoneVerificationEvents.phoneModalButtonClicked;
    const extraParams = { ...params.params, btn, section };
    eventStreamService.sendEventWithTarget(params.type, params.context, extraParams);
  }),
  phoneModalShown: wrapEventServiceWithTryCatch((section: string): void => {
    const params = phoneVerificationEvents.phoneModalShown;
    const extraParams = { ...params.params, section };
    eventStreamService.sendEventWithTarget(params.type, params.context, extraParams);
  }),
  phoneModalErrorShown: wrapEventServiceWithTryCatch(
    (section: string, error: TError, btn?: string): void => {
      const params = phoneVerificationEvents.phoneModalErrorShown;
      const errorParams = errorHandler.getErrorParam(error);
      const button = btn || "";
      const extraParams = { ...params.params, ...errorParams, section, button };
      eventStreamService.sendEventWithTarget(params.type, params.context, extraParams);
    },
  ),
  addPhoneBtnClicked: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.addPhone();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
};

export default phoneEventService;
