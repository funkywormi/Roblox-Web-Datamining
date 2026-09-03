import { DeviceMeta, CurrentUser } from "Roblox";
import { eventStreamService } from "core-roblox-utilities";
import { eventStreamNames } from "../constants/redeemGiftCardConstants";

const sendRedeemGiftCardEvent = (
  eventType: string,
  additionalProps: Record<string, unknown> = {},
) => {
  const { userId } = CurrentUser;
  eventStreamService.sendEventWithTarget(eventType, eventStreamNames.redeemGiftCard, {
    uid: userId,
    deviceType: DeviceMeta().deviceType,
    ...additionalProps,
  });
};

export default sendRedeemGiftCardEvent;
