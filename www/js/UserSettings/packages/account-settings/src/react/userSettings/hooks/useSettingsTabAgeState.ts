import { CurrentUser } from "Roblox";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { Access } from "../../../types/accessManagementTypes";
import AMPFeaturesConstants from "../constants/AMPFeaturesConstants";
import { useGetFeatureAccessQuery } from "../../apis/accessManagementApi";

// 13Plus is only used when the age of majority lookup fails
export const AgeState = {
  under13: "U13",
  teen: "13-17",
  adult: "18Plus",
  thirteenPlus: "13Plus",
};

export type TSettingsTabAgeState = {
  ageState: string;
  isReady: boolean;
};

// Age segmentation for settings tab page loads
const useSettingsTabAgeState = (): TSettingsTabAgeState => {
  const isUnder13 = CurrentUser.isUnder13;

  const { data: ageOfMajorityResult, status } = useGetFeatureAccessQuery(
    { featureName: AMPFeaturesConstants.ageOfMajorityAmpFeature },
    { skip: isUnder13 },
  );

  if (isUnder13) {
    return { ageState: AgeState.under13, isReady: true };
  }

  if (status === QueryStatus.fulfilled && ageOfMajorityResult) {
    return {
      ageState: ageOfMajorityResult.access === Access.Granted ? AgeState.adult : AgeState.teen,
      isReady: true,
    };
  }

  // Treat a failed or empty response as settled so the event still goes out.
  if (status === QueryStatus.rejected || status === QueryStatus.fulfilled) {
    return { ageState: AgeState.thirteenPlus, isReady: true };
  }

  return { ageState: AgeState.thirteenPlus, isReady: false };
};

export default useSettingsTabAgeState;
