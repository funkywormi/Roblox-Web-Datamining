import { Action, PayloadAction, ThunkAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { AccessManagementUpsellV2Service } from "Roblox";
import { authenticatedUser } from "header-scripts";
import {
  RequirementType,
  EnabledStatusValue,
  TOptionValue,
  TSettingOptionAndRequirement,
  TSettingOptionWithActions,
  TUpdateUserSettingValueRequest,
  TUserSettingsAndOptionsBody,
  TUserSettingsAndOptionsV2Body,
  UserSetting,
} from "@rbx/user-settings";
import { RootState } from "../../redux/store";
import AMPFeaturesConstants from "../../userSettings/constants/AMPFeaturesConstants";
import {
  isOptionBlockedByParentalConsent,
  optionToString,
} from "../../userSettings/utils/parentalControls/parentalConsentUtils";

type TOptionsWithRequirement = {
  [key: string]: RequirementType;
};
type TOptionsWithRequirementsList = {
  [key: string]: RequirementType[];
};

export type TSettingConsentRequirements = {
  [key in UserSetting]: TOptionsWithRequirement;
};

export type TSettingConsentRequirementsV2 = {
  [key in UserSetting]: TOptionsWithRequirementsList;
};

// Maps user id to their consent requirements
type TSettingConsentRequirementsMap = Record<number, TSettingConsentRequirements>;
type TSettingConsentRequirementsMapV2 = Record<number, TSettingConsentRequirementsV2>;

type TParentalConsentState = {
  settingConsentRequirementsMap: TSettingConsentRequirementsMap;
  settingConsentRequirementsMapV2: TSettingConsentRequirementsMapV2;
};

export type TUpdateSettingConsentRequirementsPayload = {
  userId: number;
  settingsAndOptionsBody: TUserSettingsAndOptionsBody;
};
export type TUpdateSettingConsentRequirementsV2Payload = {
  userId: number;
  settingsAndOptionsBody: TUserSettingsAndOptionsV2Body;
};

type TConsentRequirementsWithUserId = {
  userId: number;
  consentRequirements: TSettingConsentRequirements;
};
type TConsentRequirementsWithUserIdV2 = {
  userId: number;
  consentRequirements: TSettingConsentRequirementsV2;
};
const initialState: TParentalConsentState = {
  settingConsentRequirementsMap: {} as TSettingConsentRequirementsMap,
  settingConsentRequirementsMapV2: {} as TSettingConsentRequirementsMapV2,
};

const requestParentalConsent = (
  setting: string,
  value: TOptionValue,
  usePrologue: boolean, // TODO ACCMAN-3854: Remove this parameter and always enable prologue once all settings have prologue copy available
): Promise<boolean> => {
  return AccessManagementUpsellV2Service.startAccessManagementUpsell({
    featureName: AMPFeaturesConstants.settingChangeAmpFeature,
    namespace: AMPFeaturesConstants.Namespaces.SettingsChange,
    isAsyncCall: true,
    usePrologue,
    ampRecourseData: { [setting]: value },
  });
};

// The user requesting their own setting update
export const requestSettingUpdate =
  <T>({
    body,
    settingUpdateBlockedCallback,
    consentSkippedCallback,
    usePrologue,
    useRequirementsMapV2,
  }: {
    body: TUpdateUserSettingValueRequest;
    settingUpdateBlockedCallback: () => T;
    consentSkippedCallback: () => T;
    usePrologue?: boolean;
    useRequirementsMapV2?: boolean;
  }): ThunkAction<Promise<T>, RootState, unknown, Action<string>> =>
  async (_dispatch, getState): Promise<T> => {
    const { setting, value, requiredActionsOverride } = body;

    const shouldRequestConsent = isOptionBlockedByParentalConsent(
      authenticatedUser.id != null
        ? getState().parentalConsent.settingConsentRequirementsMap?.[authenticatedUser.id]
        : undefined,
      setting,
      value,
    );

    // Prefer using requiredActionsOverride when available.
    // This helps avoid problems with outdated cached data, since
    // settingConsentRequirementsMap may lag behind during asynchronous updates (like after settingsAndOptions is refetched).
    // Using requiredActionsOverride ensures we have the most current requirements.
    const userConsentRequirementsV2 =
      authenticatedUser.id != null
        ? getState().parentalConsent.settingConsentRequirementsMapV2?.[authenticatedUser.id]
        : undefined;
    const requiredActions: RequirementType[] | undefined =
      requiredActionsOverride ??
      (value !== undefined ? userConsentRequirementsV2?.[setting]?.[optionToString(value)] : []);

    const shouldRequestConsentV2 =
      requiredActions?.includes(RequirementType.ParentalConsent) ||
      requiredActions?.includes(RequirementType.ParentConsentInherited);

    const shouldRequestParentalConsent = useRequirementsMapV2
      ? shouldRequestConsentV2
      : shouldRequestConsent;

    const requiresVpcForFae = requiredActions?.includes(RequirementType.VpcForFae);

    const requiresFacialAgeEstimation = requiredActions?.includes(
      RequirementType.FacialAgeEstimation,
    );

    if (!value) return consentSkippedCallback();

    const hasAnyRequirements = (requiredActions?.length ?? 0) > 0;
    if (requiresVpcForFae) {
      await requestParentalConsent(
        UserSetting.allowFacialAgeEstimation,
        EnabledStatusValue.Enabled,
        usePrologue ?? false,
      );
      return settingUpdateBlockedCallback();
    }
    if (shouldRequestParentalConsent) {
      await requestParentalConsent(setting, value, usePrologue ?? false);
      return settingUpdateBlockedCallback();
    }
    if (requiresFacialAgeEstimation || hasAnyRequirements) {
      return settingUpdateBlockedCallback();
    }

    return consentSkippedCallback();
  };

const asOptionsWithRequirements = (
  options: TSettingOptionAndRequirement[],
): TOptionsWithRequirement => {
  const result = {} as TOptionsWithRequirement;
  options.forEach(optionAndRequirement => {
    if (optionAndRequirement.option.optionValue && optionAndRequirement.requirement) {
      result[optionToString(optionAndRequirement.option.optionValue)] =
        optionAndRequirement.requirement;
    }
  });
  return result;
};
const asOptionsWithRequirementsV2 = (
  options: TSettingOptionWithActions[],
): TOptionsWithRequirementsList => {
  const result = {} as TOptionsWithRequirementsList;
  options.forEach(optionAndRequirement => {
    if (optionAndRequirement.option.optionValue && optionAndRequirement.requiredActions) {
      result[optionToString(optionAndRequirement.option.optionValue)] =
        optionAndRequirement.requiredActions;
    }
  });
  return result;
};
export const parentalConsentSlice = createSlice({
  name: "parentalConsent",
  initialState,
  reducers: {
    updateSettingConsentRequirementsState: {
      prepare: (payload: TUpdateSettingConsentRequirementsPayload) => {
        // maps the payload to a new object with the same keys, but the values
        // are the options with requirements. i.e { settingName: { optionName: [requirements] } }
        const consentRequirements = Object.entries(
          payload.settingsAndOptionsBody,
        ).reduce<TSettingConsentRequirements>((acc, [setting, settingData]) => {
          const options = settingData?.options;
          if (options) {
            const optionsWithRequirements = asOptionsWithRequirements(options);
            return { ...acc, [setting]: optionsWithRequirements };
          }

          return acc;
        }, {} as TSettingConsentRequirements);
        const newPayload: TConsentRequirementsWithUserId = {
          userId: payload.userId,
          consentRequirements,
        };
        return { payload: newPayload };
      },
      reducer: (state, action: PayloadAction<TConsentRequirementsWithUserId>) => {
        // Add the new child's consent requirements to the map
        // eslint-disable-next-line no-param-reassign
        state.settingConsentRequirementsMap[action.payload.userId] =
          action.payload.consentRequirements;
      },
    },
    updateSettingConsentRequirementsV2State: {
      prepare: (payload: TUpdateSettingConsentRequirementsV2Payload) => {
        // maps the payload to a new object with the same keys, but the values
        // are the options with requirements. i.e { settingName: { optionName: [requirements] } }
        const consentRequirements = Object.entries(
          payload.settingsAndOptionsBody,
        ).reduce<TSettingConsentRequirementsV2>((acc, [setting, settingData]) => {
          const options = settingData?.options;
          if (options) {
            const optionsWithRequirements = asOptionsWithRequirementsV2(options);
            return { ...acc, [setting]: optionsWithRequirements };
          }

          return acc;
        }, {} as TSettingConsentRequirementsV2);
        const newPayload: TConsentRequirementsWithUserIdV2 = {
          userId: payload.userId,
          consentRequirements,
        };
        return { payload: newPayload };
      },
      reducer: (state, action: PayloadAction<TConsentRequirementsWithUserIdV2>) => {
        // Add the new child's consent requirements to the map
        // eslint-disable-next-line no-param-reassign
        state.settingConsentRequirementsMapV2[action.payload.userId] =
          action.payload.consentRequirements;
      },
    },
  },
});

export const selectSettingConsentRequirements = (
  childUserId: number,
): ((state: RootState) => TSettingConsentRequirements | undefined) =>
  createSelector(
    (state: RootState) => state.parentalConsent.settingConsentRequirementsMap,
    (settingConsentRequirementsMap: TSettingConsentRequirementsMap | undefined) =>
      settingConsentRequirementsMap?.[childUserId],
  );

export const { updateSettingConsentRequirementsState, updateSettingConsentRequirementsV2State } =
  parentalConsentSlice.actions;

export const selectSettingConsentRequirementsV2 = (
  childUserId: number,
): ((state: RootState) => TSettingConsentRequirementsV2 | undefined) =>
  createSelector(
    (state: RootState) => state.parentalConsent.settingConsentRequirementsMapV2,
    (settingConsentRequirementsMap: TSettingConsentRequirementsMapV2 | undefined) =>
      settingConsentRequirementsMap?.[childUserId],
  );

export default parentalConsentSlice.reducer;
