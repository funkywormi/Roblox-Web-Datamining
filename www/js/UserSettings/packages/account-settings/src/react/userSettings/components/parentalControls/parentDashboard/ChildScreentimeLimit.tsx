import React from "react";
import { useTranslation } from "react-utilities";
import { NativeDropdown } from "react-style-guide";
import { TUpdateUserSettingValueRequest, UserSetting, useSnackbar } from "@rbx/user-settings";
import { useUpdateUserSettingValueMutation } from "../../../../apis/userSettingsApi";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import CollapsibleUserInput from "../../../../common/components/CollapsibleUserInput";
import SettingsSection from "../../../../common/components/SettingsSection";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { handleChildSettingsUpdateError } from "../../../utils/successMessageUtils";
import screentimeUtils from "../../../utils/parentalControls/screentime/screentimeUtils";

const ChildScreentimeLimit = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const [childSettings] = useGetSettingsAndOptions(child.userId);
  const [updateChildSettings] = useUpdateUserSettingValueMutation();

  const saveScreentimeLimitHandler = async (newValue: number) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child.userId,
      setting: UserSetting.dailyScreenTimeLimit,
      value: newValue,
    };
    try {
      await updateChildSettings(updateBody).unwrap();
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error, child.userId);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  const screentimeLimitOptions = screentimeUtils.generateAllowedTimeAmountOptions(
    translate(parentalControlsTranslationConstants.parentalControlsScreentime.noLimit),
    translate(parentalControlsTranslationConstants.parentalControlsScreentime.minutesLabel),
    translate(parentalControlsTranslationConstants.parentalControlsScreentime.hoursLabel),
    translate(parentalControlsTranslationConstants.parentalControlsScreentime.hourLabel),
  );

  return (
    <SettingsSection
      description={translate(
        parentalControlsTranslationConstants.parentalControlsScreentime.description,
      )}
    >
      <React.Fragment>
        <CollapsibleUserInput
          className="screentime-limit-container"
          desktopLabel={translate(
            parentalControlsTranslationConstants.parentalControlsScreentime.dailyLimitLabel,
          )}
          mobileLabel={translate(
            parentalControlsTranslationConstants.parentalControlsScreentime.dailyLimitLabel,
          )}
          inputId="child-screentime-limit-dropdown"
        >
          <NativeDropdown
            selectionItems={
              screentimeLimitOptions as unknown as { label?: string; value?: string }[]
            }
            selectedItemvalue={
              (childSettings?.dailyScreenTimeLimit?.currentValue ??
                screentimeUtils.minutesInDay) as unknown as string
            }
            className="form-group"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              saveScreentimeLimitHandler(Number(e.target.value))
            }
          />
        </CollapsibleUserInput>
      </React.Fragment>
    </SettingsSection>
  );
};

export default ChildScreentimeLimit;
