import { useMemo } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { useTranslations } from "@rbx/www-common/i18n";
import { gamePlayButtonNamespaces } from "../constants/translations";

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
 * The merged `translate` the Play button's components take, read from the nearest `use-intl`
 * provider, which must include `gamePlayButtonNamespaces`. A key in a later namespace wins, and a
 * missing key reads as `""`, like the legacy `withTranslations` map.
 */
export const usePlayButtonTranslate = (): TranslateFunction => {
  // One call per namespace: rules-of-hooks forbids mapping over the list.
  const [guestMode, visitGame, controls, experienceDetails, downloadLanding, build, friends] =
    gamePlayButtonNamespaces;
  const tGuestMode = useTranslations(guestMode);
  const tVisitGame = useTranslations(visitGame);
  const tControls = useTranslations(controls);
  const tExperienceDetails = useTranslations(experienceDetails);
  const tDownloadLanding = useTranslations(downloadLanding);
  const tBuild = useTranslations(build);
  const tFriends = useTranslations(friends);

  return useMemo<TranslateFunction>(() => {
    // Latest first, so the first match is the one the legacy merge kept.
    const translators = [
      tFriends,
      tBuild,
      tDownloadLanding,
      tExperienceDetails,
      tControls,
      tVisitGame,
      tGuestMode,
    ];
    return (key, parameters, fallbackString) => {
      const translator = translators.find(t => t.has(key));
      return translator
        ? translator.dynamic(key, toTranslationValues(parameters))
        : (fallbackString ?? "");
    };
  }, [tGuestMode, tVisitGame, tControls, tExperienceDetails, tDownloadLanding, tBuild, tFriends]);
};
