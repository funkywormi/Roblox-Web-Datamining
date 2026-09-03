import getUserProfileReminderProps from "./getUserProfileReminderProps";
import getSponsoredAdReminderProps from "./getSponsoredAdReminderProps";
import { ArwpReminderRenderProps } from "./types";
import { CustomUrlParamsType } from "../context/ArwpUrlParamProvider";

export const ABUSE_VECTORS_WITH_REMINDERS = ["userprofile", "ad_v2"] as const;

export async function getReminderComponentAbuseVectorConfig(
  abuseVector: string,
  targetId: number,
  customParams?: CustomUrlParamsType,
): Promise<ArwpReminderRenderProps | null> {
  switch (abuseVector) {
    case "userprofile":
      return getUserProfileReminderProps(targetId);
    case "ad_v2": {
      return getSponsoredAdReminderProps(customParams);
    }
    default:
      return null;
  }
}

export default getReminderComponentAbuseVectorConfig;
