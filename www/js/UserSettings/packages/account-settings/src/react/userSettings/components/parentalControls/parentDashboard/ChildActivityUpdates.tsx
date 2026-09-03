import React from "react";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { useTranslation } from "@rbx/core-scripts/react";
import { Toggle } from "@rbx/foundation-ui";
import {
  DigestEmailCadence,
  ParentLinkSettingName,
  SettingControlItem,
  useSnackbar,
} from "@rbx/user-settings";
import {
  useGetParentLinkSettingsQuery,
  useUpdateParentLinkSettingsMutation,
} from "../../../../apis/parentalControlsApi";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";

const ACTIVITY_UPDATES_TOGGLE_ID = "activity-updates-toggle";

const digestEmailCadenceToToggleState = (cadence: DigestEmailCadence | undefined): boolean =>
  cadence === DigestEmailCadence.Weekly;

const toggleStateToDigestEmailCadence = (
  isChecked: boolean,
): DigestEmailCadence.Never | DigestEmailCadence.Weekly =>
  isChecked ? DigestEmailCadence.Weekly : DigestEmailCadence.Never;

const ChildActivityUpdates = ({ child }: { child: TChildInfo }): React.JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const { data: parentLinkSettings, isFetching: isParentLinkSettingsFetching } =
    useGetParentLinkSettingsQuery(child.userId);
  const [updateParentLinkSettings, { status: updateStatus }] =
    useUpdateParentLinkSettingsMutation();

  const isToggleOn = digestEmailCadenceToToggleState(parentLinkSettings?.digestEmailCadence);
  const isUpdating = updateStatus === QueryStatus.pending;
  const isToggleDisabled = !parentLinkSettings || isParentLinkSettingsFetching || isUpdating;

  const updateActivityUpdates = async (isChecked: boolean) => {
    if (!parentLinkSettings || isParentLinkSettingsFetching || isUpdating) {
      return;
    }

    const settingValue = toggleStateToDigestEmailCadence(isChecked);
    try {
      await updateParentLinkSettings({
        childUserId: child.userId,
        settingName: ParentLinkSettingName.DigestEmailCadence,
        settingValue,
      }).unwrap();
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
    } catch {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  };

  const toggleActivityUpdatesHandler = (isChecked: boolean) => {
    updateActivityUpdates(isChecked).catch(() => undefined);
  };

  const activityUpdatesLabel = translate(
    parentalControlsTranslationConstants.activityUpdates.description,
  );

  return (
    <SettingControlItem
      id={ACTIVITY_UPDATES_TOGGLE_ID}
      label={activityUpdatesLabel}
      labelClassName="max-width-[380px] text-body-medium content-default"
      control={
        <Toggle
          id={ACTIVITY_UPDATES_TOGGLE_ID}
          aria-label={activityUpdatesLabel}
          size="Medium"
          placement="End"
          isChecked={isToggleOn}
          onCheckedChange={toggleActivityUpdatesHandler}
          isDisabled={isToggleDisabled}
        />
      }
    />
  );
};

export default ChildActivityUpdates;
