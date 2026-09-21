import sendAXTracking from "./sendAXTracking";
import { AXErrorContextType, AXSendTrackingActionType } from "./types";

const reportAXError = ({ log, itemName, counterName }: AXErrorContextType): void => {
  sendAXTracking({
    itemName: `AXError_${itemName}`,
    counterName,
    metaData: {
      metaData: log,
    },
    actionType: AXSendTrackingActionType.Error,
  });
};

export default reportAXError;
