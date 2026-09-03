import { ExperimentationService } from 'Roblox';
import {
  accountSwitcherLayerName,
  foundationAccountSwitcherListParameter
} from '../constants/accountSwitcherConstants';
import type { AccountSwitcherListVariant } from '../components/FoundationAccountSwitcherList';

type AccountSwitcherListExperimentValues = {
  [foundationAccountSwitcherListParameter]?: unknown;
};

export type AccountSwitcherListExperimentResolution = {
  isEnrolled: boolean;
  variant: AccountSwitcherListVariant;
};

export const accountSwitcherListExperimentTimeoutMs = 2000;

export const getAccountSwitcherListVariantFromExperimentValues = (
  values: AccountSwitcherListExperimentValues
): AccountSwitcherListVariant =>
  values[foundationAccountSwitcherListParameter] === true ? 'foundation' : 'legacy';

export const resolveAccountSwitcherListExperiment = (
  values: AccountSwitcherListExperimentValues
): AccountSwitcherListExperimentResolution => ({
  isEnrolled: foundationAccountSwitcherListParameter in values,
  variant: getAccountSwitcherListVariantFromExperimentValues(values)
});

export const getAccountSwitcherListExperiment = async (): Promise<AccountSwitcherListExperimentResolution> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const experimentParameterValues = await Promise.race([
      ExperimentationService?.getAllValuesForLayer(accountSwitcherLayerName),
      new Promise<undefined>(resolve => {
        timeoutId = setTimeout(() => resolve(undefined), accountSwitcherListExperimentTimeoutMs);
      })
    ]);
    return resolveAccountSwitcherListExperiment(experimentParameterValues ?? {});
  } catch {
    return resolveAccountSwitcherListExperiment({});
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
};

export const logAccountSwitcherListExperimentExposure = (): void => {
  try {
    ExperimentationService?.logLayerExposure?.(accountSwitcherLayerName);
  } catch {
    // Exposure logging is best-effort and must never block the account switcher.
  }
};
