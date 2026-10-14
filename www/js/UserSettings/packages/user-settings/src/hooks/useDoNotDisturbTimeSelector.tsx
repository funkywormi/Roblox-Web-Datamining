import React, { useState, useEffect } from "react";
import { Dropdown, Menu, MenuItem, MenuSection } from "@rbx/foundation-ui";
import {
  minutesToTimeComponents,
  timeComponentsToMinutes,
  generateHourOptions,
  generateMinuteOptions,
  generateAmPmOptions,
  type TTimeComponents,
} from "../utils/timeUtils";
import type { TTimeSelectorLabels } from "./useTimeSelector";

export function useDoNotDisturbTimeSelector(
  initialMinutes: number,
  labels: TTimeSelectorLabels,
): { selectedMinutes: number; timeSelector: React.JSX.Element; resetTime: () => void } {
  const [selectedTime, setSelectedTime] = useState(() => minutesToTimeComponents(initialMinutes));

  useEffect(() => {
    setSelectedTime(minutesToTimeComponents(initialMinutes));
  }, [initialMinutes]);

  const resetTime = () => {
    setSelectedTime(minutesToTimeComponents(initialMinutes));
  };
  const updateTime = (changes: Partial<TTimeComponents>) => {
    setSelectedTime(previous => ({ ...previous, ...changes }));
  };

  const initialMinute = minutesToTimeComponents(initialMinutes).minute;
  const minuteOptions = generateMinuteOptions();
  if (initialMinute % 15 !== 0) {
    minuteOptions.push({
      label: initialMinute.toString().padStart(2, "0"),
      value: initialMinute.toString(),
    });
    minuteOptions.sort((a, b) => Number(a.value) - Number(b.value));
  }

  const dropdowns = [
    {
      id: "hour-dropdown",
      label: labels.hourLabel,
      options: generateHourOptions(),
      value: selectedTime.hour.toString(),
      onChange: (value: string) => {
        updateTime({ hour: Number(value) });
      },
    },
    {
      id: "minute-dropdown",
      label: labels.minuteLabel,
      options: minuteOptions,
      value: selectedTime.minute.toString(),
      onChange: (value: string) => {
        updateTime({ minute: Number(value) });
      },
    },
    {
      id: "ampm-dropdown",
      label: labels.ampmLabel,
      options: generateAmPmOptions(labels.amLabel, labels.pmLabel),
      value: selectedTime.isPM ? "PM" : "AM",
      onChange: (value: string) => {
        updateTime({ isPM: value === "PM" });
      },
    },
  ];

  return {
    selectedMinutes: timeComponentsToMinutes(
      selectedTime.hour,
      selectedTime.minute,
      selectedTime.isPM,
    ),
    resetTime,
    timeSelector: (
      <div className="flex gap-small">
        {dropdowns.map(({ id, label, options, value, onChange }) => (
          <Dropdown
            key={id}
            className="basis-0 grow-1"
            label={label}
            size="Medium"
            placeholder=""
            value={value}
            onValueChange={onChange}
          >
            <Menu>
              <MenuSection>
                {options.map(option => (
                  <MenuItem key={option.value} value={option.value} title={option.label} />
                ))}
              </MenuSection>
            </Menu>
          </Dropdown>
        ))}
      </div>
    ),
  };
}
