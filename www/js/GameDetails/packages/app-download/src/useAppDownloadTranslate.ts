import { useMemo } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { useTranslations } from "@rbx/www-common/i18n";
import { appDownloadNamespaces } from "./constants";

type TranslationValues = Record<string, string | number | Date>;

const toTranslationValues = (parameters?: Record<string, unknown>): TranslationValues | undefined =>
  parameters &&
  Object.fromEntries(
    Object.entries(parameters).filter(
      (entry): entry is [string, string | number | Date] =>
        typeof entry[1] === "string" || typeof entry[1] === "number" || entry[1] instanceof Date,
    ),
  );

/**
 * The merged `translate` app-download's components take, read from the nearest `use-intl` provider,
 * which must include `appDownloadNamespaces`. Feature.DownloadLanding wins over Common.VisitGame,
 * like the legacy merged map.
 */
export const useAppDownloadTranslate = (): TranslateFunction => {
  const [downloadLanding, visitGame] = appDownloadNamespaces;
  const tDownload = useTranslations(downloadLanding);
  const tVisitGame = useTranslations(visitGame);

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
