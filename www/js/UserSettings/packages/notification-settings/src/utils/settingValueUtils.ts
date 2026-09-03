import { AllowedStatusValue, EnabledStatusValue } from "@rbx/user-settings";

export type BooleanOptionValues = {
  enabledValue: EnabledStatusValue | AllowedStatusValue;
  disabledValue: EnabledStatusValue | AllowedStatusValue;
};

/**
 * Resolves the backend-expected option values for a BooleanSelection preference.
 *
 * Most settings use "Enabled"/"Disabled", but some use "Allowed"/"Disallowed"
 * (e.g. AllowEnablePushNotifications). We pair the currently selected option's
 * value with its `enabled` boolean to figure out which value string represents
 * each state, falling back to EnabledStatusValue if we can't derive it.
 */
export const resolveBooleanOptionValues = (
  selectedOption: { value: string; enabled?: boolean } | null | undefined,
  availableOptionValues: readonly string[],
): BooleanOptionValues => {
  const fallback: BooleanOptionValues = {
    enabledValue: EnabledStatusValue.Enabled,
    disabledValue: EnabledStatusValue.Disabled,
  };
  if (selectedOption?.enabled == null) return fallback;
  const otherValue = availableOptionValues.find(value => value !== selectedOption.value);
  if (otherValue == null) return fallback;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const selected = selectedOption.value as EnabledStatusValue | AllowedStatusValue;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const other = otherValue as EnabledStatusValue | AllowedStatusValue;
  return selectedOption.enabled
    ? { enabledValue: selected, disabledValue: other }
    : { enabledValue: other, disabledValue: selected };
};
