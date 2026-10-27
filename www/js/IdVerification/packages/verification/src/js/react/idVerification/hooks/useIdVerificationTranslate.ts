import { useMemo } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { useTranslations } from "@rbx/www-common/i18n";

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
        typeof entry[1] === "string" || typeof entry[1] === "number" || entry[1] instanceof Date,
    ),
  );

/** Translators latest first, so the first match is the one the legacy `withTranslations` merge kept. */
const mergeTranslators =
  (translators: readonly RuntimeTranslator[]): TranslateFunction =>
  (key, parameters, fallbackString) => {
    const translator = translators.find(t => t.has(key));
    return translator
      ? translator.dynamic(key, toTranslationValues(parameters))
      : (fallbackString ?? "");
  };

/** `translate` over `CommonUI.Controls` and `Verification.Identity`, the IDV views' namespaces. */
export const useIdVerificationTranslate = (): TranslateFunction => {
  const tControls = useTranslations("CommonUI.Controls");
  const tIdentity = useTranslations("Verification.Identity");
  return useMemo(() => mergeTranslators([tIdentity, tControls]), [tIdentity, tControls]);
};

/** `translate` over `Feature.VerificationUpsell`, the email upsell modal's namespace. */
export const useEmailUpsellTranslate = (): TranslateFunction => {
  const tUpsell = useTranslations("Feature.VerificationUpsell");
  return useMemo(() => mergeTranslators([tUpsell]), [tUpsell]);
};
