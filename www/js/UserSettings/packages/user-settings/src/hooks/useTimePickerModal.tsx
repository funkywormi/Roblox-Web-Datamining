import React, { useState, useEffect, ChangeEvent } from "react";
import { NativeDropdown } from "@rbx/core-ui";
import { useSettingsModal, type IModalService } from "./useSettingsModal";
import {
  minutesToTimeComponents,
  timeComponentsToMinutes,
  generateHourOptions,
  generateMinuteOptions,
  generateAmPmOptions,
  type TTimeComponents,
} from "../utils/timeUtils";

export type TTimePickerModalProps = {
  /** Modal title text */
  titleText: string;
  /** Description shown above the time picker */
  bodyText?: string;
  /** Text for the save/confirm button */
  actionButtonText: string;
  /** Text for the cancel button */
  cancelButtonText: string;
  /** Accessibility label for the close button */
  closeLabel: string;
  /** Callback when the user confirms their selection */
  onAction: (selectedTimeMinutes: number) => void | Promise<void>;
  /** Initial time value in minutes from midnight */
  initTimeMinutes: number;
  /** Time value that should be marked as invalid (e.g., to prevent same start/end time) */
  invalidTimeMinutes?: number;
  /** Error message shown when the selected time equals invalidTimeMinutes */
  errorText?: string;
  /** Label for the hour dropdown */
  hourLabel: string;
  /** Label for the minute dropdown */
  minuteLabel: string;
  /** Label for the AM/PM dropdown */
  ampmLabel: string;
  /** Translated "AM" text */
  amLabel: string;
  /** Translated "PM" text */
  pmLabel: string;
};

/**
 * A hook that provides a time picker modal with hour, minute, and AM/PM dropdowns.
 * Built on top of useSettingsModal for consistent styling.
 *
 * @returns Tuple of [modalElement, modalService] where modalService can be used to open/close the modal
 */
export function useTimePickerModal({
  titleText,
  bodyText,
  actionButtonText,
  cancelButtonText,
  closeLabel,
  onAction,
  initTimeMinutes,
  invalidTimeMinutes,
  errorText,
  hourLabel,
  minuteLabel,
  ampmLabel,
  amLabel,
  pmLabel,
}: TTimePickerModalProps): [React.JSX.Element, IModalService] {
  const [selectedTime, setSelectedTime] = useState<TTimeComponents>({
    hour: 12,
    minute: 0,
    isPM: false,
  });

  useEffect(() => {
    if (initTimeMinutes >= 0) {
      setSelectedTime(minutesToTimeComponents(initTimeMinutes));
    }
  }, [initTimeMinutes]);

  const handleTimeSelection = (partName: string, value: string) => {
    setSelectedTime(prev => {
      const newTime = { ...prev };
      if (partName === "hour") {
        newTime.hour = Number(value);
      } else if (partName === "minute") {
        newTime.minute = Number(value);
      } else if (partName === "ampm") {
        newTime.isPM = value === "PM";
      }
      return newTime;
    });
  };

  const selectedMinutes = timeComponentsToMinutes(
    selectedTime.hour,
    selectedTime.minute,
    selectedTime.isPM,
  );

  const isTimeInvalid = invalidTimeMinutes !== undefined && selectedMinutes === invalidTimeMinutes;

  const hourOptions = generateHourOptions();
  const minuteOptions = generateMinuteOptions();
  const ampmOptions = generateAmPmOptions(amLabel, pmLabel);

  const timeBody = (
    <div className="flex flex-col margin-top-small">
      {bodyText && <span className="text-body-medium">{bodyText}</span>}
      <div className="flex gap-small">
        <div className="flex flex-col gap-xsmall flex-1">
          <label className="text-label-small" htmlFor="time-picker-hour-select">
            {hourLabel}
          </label>
          <NativeDropdown
            id="time-picker-hour-select"
            selectionItems={hourOptions}
            selectedItemvalue={selectedTime.hour.toString()}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              handleTimeSelection("hour", e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-xsmall flex-1">
          <label className="text-label-small" htmlFor="time-picker-minute-select">
            {minuteLabel}
          </label>
          <NativeDropdown
            id="time-picker-minute-select"
            selectionItems={minuteOptions}
            selectedItemvalue={selectedTime.minute.toString()}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              handleTimeSelection("minute", e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-xsmall flex-1">
          <label className="text-label-small" htmlFor="time-picker-ampm-select">
            {ampmLabel}
          </label>
          <NativeDropdown
            id="time-picker-ampm-select"
            selectionItems={ampmOptions}
            selectedItemvalue={selectedTime.isPM ? "PM" : "AM"}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              handleTimeSelection("ampm", e.target.value);
            }}
          />
        </div>
      </div>
      {isTimeInvalid && errorText && (
        <span className="text-error text-body-small">{errorText}</span>
      )}
    </div>
  );

  const [modal, modalService] = useSettingsModal({
    translatedTitle: titleText,
    translatedBody: timeBody,
    translatedActionButtonText: actionButtonText,
    translatedSecondaryButtonText: cancelButtonText,
    translatedCloseLabel: closeLabel,
    size: "Medium",
    disableActionButton: isTimeInvalid,
    onAction: () => {
      // eslint-disable-next-line no-void
      void onAction(selectedMinutes);
    },
    onDismiss: () => {
      setSelectedTime(minutesToTimeComponents(initTimeMinutes));
    },
    onSecondary: () => {
      setSelectedTime(minutesToTimeComponents(initTimeMinutes));
    },
  });

  return [modal, modalService];
}
