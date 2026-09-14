import * as http from "@rbx/core-scripts/http";
import { featureAccessUrl } from "../constants/urlConstants";
import {
  ACCESS_GRANTED,
  PARENT_MANAGED_LIMITS_AMP_FEATURE,
  type TFeatureAccessResponse,
} from "../types/askParentTypes";

/**
 * Whether AMP says this child may ask a parent about their transfer limits.
 *
 * The feature answers the rollout and the verified-parental-consent age band
 * together, so a denial does not say which one failed. It says nothing at all
 * about whether a parent has capped this child, so it has to be paired with the
 * binding the tab works out from the stored caps and the tier ceilings.
 */
export const getCanParentManageChildRobuxTransferLimits = async (): Promise<boolean> => {
  const { data } = await http.get<TFeatureAccessResponse>(
    { url: featureAccessUrl, withCredentials: true },
    { featureName: PARENT_MANAGED_LIMITS_AMP_FEATURE },
  );

  return data.access === ACCESS_GRANTED;
};
