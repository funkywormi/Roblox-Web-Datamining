import { ExperimentationService } from "Roblox";
import baseApi from "./common/baseApi";
import {
  RealNamesInDisplayNamesLayer,
  DisableOnLowSpecAndroidLayer,
  AccountSettingsAccountInfoUxLayer,
} from "../userSettings/constants/experimentConstants";

export const experimentApi = baseApi.injectEndpoints({
  endpoints: builder => {
    return {
      getDisplayAgedUpDisplayName: builder.query<boolean, void>({
        queryFn: async () => {
          if (ExperimentationService?.getAllValuesForLayer) {
            try {
              const ixpResult = await ExperimentationService.getAllValuesForLayer(
                RealNamesInDisplayNamesLayer,
              );
              return { data: ixpResult?.AllowRealNames as boolean };
            } catch {
              return { data: false };
            }
          }
          return { data: false };
        },
      }),
      getDisplayCameraNotAvailable: builder.query<boolean, void>({
        queryFn: async () => {
          if (ExperimentationService?.getAllValuesForLayer) {
            try {
              const ixpResult = await ExperimentationService.getAllValuesForLayer(
                DisableOnLowSpecAndroidLayer,
              );
              return { data: ixpResult?.DisableOnAndroid as boolean };
            } catch {
              return { data: false };
            }
          }
          return { data: false };
        },
      }),
      getEmailConsentCheckboxEnabled: builder.query<boolean, void>({
        queryFn: async () => {
          if (ExperimentationService?.getAllValuesForLayer) {
            try {
              const ixpResult = await ExperimentationService.getAllValuesForLayer(
                AccountSettingsAccountInfoUxLayer,
              );
              return { data: ixpResult?.emailConsentCheckboxEnabled as boolean };
            } catch {
              return { data: false };
            }
          }
          return { data: false };
        },
      }),
    };
  },
});

// Export hooks for usage in functional components
export const {
  useGetDisplayAgedUpDisplayNameQuery,
  useGetDisplayCameraNotAvailableQuery,
  useGetEmailConsentCheckboxEnabledQuery,
} = experimentApi;
