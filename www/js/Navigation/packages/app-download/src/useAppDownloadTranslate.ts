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

/** The parts of a `Translator` that take a runtime string key, so translators of any namespace fit. */
type MergeableTranslator = {
  has: (key: string) => boolean;
  dynamic: (key: string, values?: TranslationValues) => string;
};

/**
 * One legacy-style `translate` over several namespaces: the first translator that has the key
 * wins, then the fallback string.
 */
export const mergeTranslators =
  (translators: readonly MergeableTranslator[]): TranslateFunction =>
  (key, parameters, fallbackString) => {
    const values = toTranslationValues(parameters);
    const translator = translators.find(t => t.has(key));
    return translator ? translator.dynamic(key, values) : (fallbackString ?? "");
  };

/**
 * The merged `translate` app-download's components take, read from the nearest `use-intl` provider,
 * which must include `appDownloadNamespaces`. Feature.DownloadLanding wins over Common.VisitGame,
 * like the legacy merged map.
 */
export const useAppDownloadTranslate = (): TranslateFunction => {
  const [downloadLanding, visitGame] = appDownloadNamespaces;
  const tDownload = useTranslations(downloadLanding);
  const tVisitGame = useTranslations(visitGame);

  return useMemo(() => mergeTranslators([tDownload, tVisitGame]), [tDownload, tVisitGame]);
};
