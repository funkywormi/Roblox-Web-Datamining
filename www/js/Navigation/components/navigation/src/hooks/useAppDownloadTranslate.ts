import { useMemo } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { useTranslations } from "@rbx/www-common/i18n";

type TranslationValues = Record<string, string | number | Date>;

const toTranslationValues = (parameters?: Record<string, unknown>): TranslationValues | undefined =>
  parameters &&
  Object.fromEntries(
    Object.entries(parameters).filter(
      (entry): entry is [string, string | number | Date] =>
        typeof entry[1] === "string" || typeof entry[1] === "number" || entry[1] instanceof Date,
    ),
  );

// @rbx/app-download still takes the legacy merged translate; its keys span these two namespaces.
export const useAppDownloadTranslate = (): TranslateFunction => {
  const tDownload = useTranslations("Feature.DownloadLanding");
  const tVisitGame = useTranslations("Common.VisitGame");

  return useMemo<TranslateFunction>(
    () => (key, parameters, fallbackString) => {
      const values = toTranslationValues(parameters);
      if (tDownload.has(key)) {
        return tDownload(key, values);
      }
      if (tVisitGame.has(key)) {
        return tVisitGame(key, values);
      }
      return fallbackString ?? "";
    },
    [tDownload, tVisitGame],
  );
};
