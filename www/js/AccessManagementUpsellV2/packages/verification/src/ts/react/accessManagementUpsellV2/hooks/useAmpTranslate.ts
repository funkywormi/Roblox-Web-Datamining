import { useMemo } from 'react';
import type { TranslateFunction } from '@rbx/core-scripts/react';
import { useTranslations } from '@rbx/www-common/i18n';

type TranslationValues = Record<string, string | number | Date>;

type RuntimeTranslator = {
  has: (key: string) => boolean;
  dynamic: (key: string, values?: TranslationValues) => string;
};

const toTranslationValues = (parameters?: Record<string, unknown>): TranslationValues | undefined =>
  parameters &&
  Object.fromEntries(
    Object.entries(parameters).filter(
      (entry): entry is [string, string | number | Date] =>
        typeof entry[1] === 'string' || typeof entry[1] === 'number' || entry[1] instanceof Date
    )
  );

/** Translators latest first, so the first match is the one the legacy `withTranslations` merge kept. */
const mergeTranslators =
  (translators: readonly RuntimeTranslator[]): TranslateFunction =>
  (key, parameters, fallbackString) => {
    const translator = translators.find(t => t.has(key));
    return translator
      ? translator.dynamic(key, toTranslationValues(parameters))
      : (fallbackString ?? '');
  };

/** `accessManagementUpselTranslationConfig`: the wizard shell and its recourses. */
export const useAccessManagementTranslate = (): TranslateFunction => {
  const tControls = useTranslations('CommonUI.Controls');
  const tFeatures = useTranslations('CommonUI.Features');
  const tUpsell = useTranslations('Amp.Upsell');
  const tFaeUpsell = useTranslations('Amp.FAEUpsell');
  const tFriends = useTranslations('Feature.Friends');
  const tAccountSettings = useTranslations('Feature.AccountSettings');
  const tParents = useTranslations('Feature.Parents');
  const tIdentity = useTranslations('Verification.Identity');
  return useMemo(
    () =>
      mergeTranslators([
        tIdentity,
        tParents,
        tAccountSettings,
        tFriends,
        tFaeUpsell,
        tUpsell,
        tFeatures,
        tControls
      ]),
    [tIdentity, tParents, tAccountSettings, tFriends, tFaeUpsell, tUpsell, tFeatures, tControls]
  );
};

/** `emailUpsellTranslationConfig`. */
export const useEmailUpsellTranslate = (): TranslateFunction => {
  const tControls = useTranslations('CommonUI.Controls');
  const tUpsell = useTranslations('Feature.VerificationUpsell');
  return useMemo(() => mergeTranslators([tUpsell, tControls]), [tUpsell, tControls]);
};

/** `updateSettingsTranslationConfig`. */
export const useUpdateSettingsTranslate = (): TranslateFunction => {
  const tControls = useTranslations('CommonUI.Controls');
  const tContent = useTranslations('Feature.LegallySensitiveContent');
  return useMemo(() => mergeTranslators([tContent, tControls]), [tContent, tControls]);
};

/** `legallySensitiveContentTranslationConfig`. */
export const useLegallySensitiveContentTranslate = (): TranslateFunction => {
  const tControls = useTranslations('CommonUI.Controls');
  const tParents = useTranslations('Feature.Parents');
  const tAccountSettings = useTranslations('Feature.AccountSettings');
  const tContent = useTranslations('Feature.LegallySensitiveContent');
  return useMemo(
    () => mergeTranslators([tContent, tAccountSettings, tParents, tControls]),
    [tContent, tAccountSettings, tParents, tControls]
  );
};

/** `parentalRequestTranslationConfig`. */
export const useParentalRequestTranslate = (): TranslateFunction => {
  const tControls = useTranslations('CommonUI.Controls');
  const tFeatures = useTranslations('CommonUI.Features');
  const tUpsell = useTranslations('Amp.Upsell');
  const tParents = useTranslations('Feature.Parents');
  return useMemo(
    () => mergeTranslators([tParents, tUpsell, tFeatures, tControls]),
    [tParents, tUpsell, tFeatures, tControls]
  );
};

/** `accountSettingsRedirectTranslationConfig`. */
export const useAccountSettingsRedirectTranslate = (): TranslateFunction => {
  const tUpsell = useTranslations('Feature.AgeVerificationUpsell');
  return useMemo(() => mergeTranslators([tUpsell]), [tUpsell]);
};
