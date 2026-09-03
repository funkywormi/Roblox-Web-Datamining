import { JSX, useEffect, useRef, useState } from "react";
import { useFragment } from "react-relay";
import { Toggle } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  SettingControlItem,
  RequirementType,
  useTimePickerModal,
  minutesToTimeString,
} from "@rbx/user-settings";
import { useUpdateUserSetting } from "../../hooks/useUpdateUserSetting";
import { useRefetchNotificationSettings } from "../../hooks/useRefetchNotificationSettings";
import { resolveBooleanOptionValues } from "../../utils/settingValueUtils";
import translationConstants from "../../constants/translationConstants";
import type { DoNotDisturbSettingFragment$key } from "./__generated__/DoNotDisturbSettingFragment.graphql";
import DoNotDisturbSettingFragmentNode from "./__generated__/DoNotDisturbSettingFragment.graphql";

type DoNotDisturbSettingProps = {
  doNotDisturbRef: DoNotDisturbSettingFragment$key;
};

export const DoNotDisturbSetting = ({
  doNotDisturbRef,
}: DoNotDisturbSettingProps): JSX.Element | null => {
  const { translate } = useTranslation();

  const refetchNotificationSettings = useRefetchNotificationSettings();

  const doNotDisturb = useFragment<DoNotDisturbSettingFragment$key>(
    DoNotDisturbSettingFragmentNode,
    doNotDisturbRef,
  );

  const fragmentEnabled = doNotDisturb.enabled.selectedOption?.enabled ?? false;
  const fragmentStartTimeMinutes = doNotDisturb.timeWindow.value?.startTimeMinutes ?? 0;
  const fragmentEndTimeMinutes = doNotDisturb.timeWindow.value?.endTimeMinutes ?? 0;

  const [isEnabled, setIsEnabled] = useState(fragmentEnabled);
  const [startTimeMinutes, setStartTimeMinutes] = useState(fragmentStartTimeMinutes);
  const [endTimeMinutes, setEndTimeMinutes] = useState(fragmentEndTimeMinutes);

  // TODO: Temporary fix to ensure local state is updated when the fragment data changes.
  // Once we have relay mutations in place, we can remove this effect.
  useEffect(() => {
    setIsEnabled(fragmentEnabled);
  }, [fragmentEnabled]);

  useEffect(() => {
    setStartTimeMinutes(fragmentStartTimeMinutes);
    setEndTimeMinutes(fragmentEndTimeMinutes);
  }, [fragmentStartTimeMinutes, fragmentEndTimeMinutes]);

  // Store previous time values for rollback on error
  const previousTimeRef = useRef({ start: startTimeMinutes, end: endTimeMinutes });

  const { updateSetting: updateToggle, isPending: isTogglePending } = useUpdateUserSetting({
    onSuccess: () => {
      // TODO: Force refetch until we have relay mutations in place
      refetchNotificationSettings();
    },
    onError: () => {
      setIsEnabled(prev => !prev);
    },
  });

  const { updateSetting: updateTimeWindow, isPending: isTimeWindowPending } = useUpdateUserSetting({
    onError: () => {
      setStartTimeMinutes(previousTimeRef.current.start);
      setEndTimeMinutes(previousTimeRef.current.end);
    },
  });

  const requiredActions = new Set(
    doNotDisturb.enabled.availableOptions.flatMap(opt =>
      opt.requiredActions.map(a => a.actionType),
    ),
  );
  const isParentEnforced = requiredActions.has(RequirementType.ParentalConsent);
  const canToggle = doNotDisturb.enabled.availableOptions.length > 1 && requiredActions.size === 0;

  const { enabledValue, disabledValue } = resolveBooleanOptionValues(
    doNotDisturb.enabled.selectedOption,
    doNotDisturb.enabled.availableOptions.map(opt => opt.option.value),
  );

  const handleToggle = () => {
    if (!canToggle || isTogglePending) return;

    const newValue = !isEnabled;
    setIsEnabled(newValue);

    updateToggle({
      settingKey: doNotDisturb.enabled.setting.value,
      value: newValue ? enabledValue : disabledValue,
    });
  };

  const handleUpdateTimeWindow = (newStart: number, newEnd: number) => {
    if (isTimeWindowPending) return;

    previousTimeRef.current = { start: startTimeMinutes, end: endTimeMinutes };
    setStartTimeMinutes(newStart);
    setEndTimeMinutes(newEnd);

    updateTimeWindow({
      settingKey: doNotDisturb.timeWindow.setting.value,
      value: { startTimeMinutes: newStart, endTimeMinutes: newEnd },
    });
  };

  const label = translate(translationConstants.dndHeading);
  const description = isParentEnforced
    ? translate(translationConstants.parentEnforcedDoNotDisturb)
    : translate(translationConstants.dndDescription);

  const [startTimeModal, startTimeModalService] = useTimePickerModal({
    titleText: translate(translationConstants.dndStartTimeModalTitle),
    actionButtonText: translate(translationConstants.actionSave),
    cancelButtonText: translate(translationConstants.actionCancel),
    closeLabel: translate(translationConstants.actionClose),
    onAction: (selectedTime: number) => {
      handleUpdateTimeWindow(selectedTime, endTimeMinutes);
    },
    initTimeMinutes: startTimeMinutes,
    invalidTimeMinutes: endTimeMinutes,
    errorText: translate(translationConstants.dndTimeWindowError),
    hourLabel: translate(translationConstants.dndHourLabel),
    minuteLabel: translate(translationConstants.dndMinuteLabel),
    ampmLabel: translate(translationConstants.dndAmPmLabel),
    amLabel: translate(translationConstants.dndAmLabel),
    pmLabel: translate(translationConstants.dndPmLabel),
  });

  const [endTimeModal, endTimeModalService] = useTimePickerModal({
    titleText: translate(translationConstants.dndEndTimeModalTitle),
    actionButtonText: translate(translationConstants.actionSave),
    cancelButtonText: translate(translationConstants.actionCancel),
    closeLabel: translate(translationConstants.actionClose),
    onAction: (selectedTime: number) => {
      handleUpdateTimeWindow(startTimeMinutes, selectedTime);
    },
    initTimeMinutes: endTimeMinutes,
    invalidTimeMinutes: startTimeMinutes,
    errorText: translate(translationConstants.dndTimeWindowError),
    hourLabel: translate(translationConstants.dndHourLabel),
    minuteLabel: translate(translationConstants.dndMinuteLabel),
    ampmLabel: translate(translationConstants.dndAmPmLabel),
    amLabel: translate(translationConstants.dndAmLabel),
    pmLabel: translate(translationConstants.dndPmLabel),
  });

  const startTimeString = minutesToTimeString(
    startTimeMinutes,
    translate(translationConstants.dndAmLabel),
    translate(translationConstants.dndPmLabel),
  );

  const endTimeString = minutesToTimeString(
    endTimeMinutes,
    translate(translationConstants.dndAmLabel),
    translate(translationConstants.dndPmLabel),
  );

  return (
    <div className="do-not-disturb-setting mt-large">
      {/* Global Do Not Disturb toggle */}
      <SettingControlItem
        id="do-not-disturb-toggle"
        label={label}
        description={description}
        labelClassName={isParentEnforced ? "content-default" : undefined}
        descriptionClassName={isParentEnforced ? "content-default" : undefined}
        control={
          <div className="flex items-center gap-small">
            <Toggle
              aria-label={label}
              size="Medium"
              placement="End"
              isChecked={isEnabled}
              onCheckedChange={handleToggle}
              isDisabled={!canToggle || isTogglePending}
            />
          </div>
        }
      />

      {isEnabled && (
        <div className="do-not-disturb-time-settings mt-medium">
          {/* Start time selector */}
          <div
            className={`time-selector-row flex items-center justify-between py-xsmall ${
              canToggle ? "cursor-pointer" : "cursor-not-allowed content-default"
            }`}
            onClick={() => {
              if (canToggle) startTimeModalService.open();
            }}
            role="button"
            aria-disabled={!canToggle}
            tabIndex={canToggle ? 0 : -1}
            onKeyDown={e => {
              if (canToggle && (e.key === "Enter" || e.key === " ")) {
                startTimeModalService.open();
              }
            }}
          >
            <span className={`text-body-medium${canToggle ? "" : " content-default"}`}>
              {translate(translationConstants.dndStartLabel)}
            </span>
            <span
              className={`flex items-center gap-xsmall text-body-medium${
                canToggle ? "" : " content-default"
              }`}
            >
              {startTimeString}
              {canToggle && <span className="icon-chevron-heavy-right" />}
            </span>
          </div>

          {/* End time selector */}
          <div
            className={`time-selector-row flex items-center justify-between py-xsmall ${
              canToggle ? "cursor-pointer" : "cursor-not-allowed content-default"
            }`}
            onClick={() => {
              if (canToggle) endTimeModalService.open();
            }}
            role="button"
            aria-disabled={!canToggle}
            tabIndex={canToggle ? 0 : -1}
            onKeyDown={e => {
              if (canToggle && (e.key === "Enter" || e.key === " ")) {
                endTimeModalService.open();
              }
            }}
          >
            <span className={`text-body-medium${canToggle ? "" : " content-default"}`}>
              {translate(translationConstants.dndEndLabel)}
            </span>
            <span
              className={`flex items-center gap-xsmall text-body-medium${
                canToggle ? "" : " content-default"
              }`}
            >
              {endTimeString}
              {canToggle && <span className="icon-chevron-heavy-right" />}
            </span>
          </div>
        </div>
      )}

      {startTimeModal}
      {endTimeModal}
    </div>
  );
};

export default DoNotDisturbSetting;
