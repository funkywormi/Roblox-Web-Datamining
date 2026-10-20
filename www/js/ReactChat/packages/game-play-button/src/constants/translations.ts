import type { Namespace } from "@rbx/www-common/i18n";

/**
 * The namespaces the Play button's strings come from; every entry that renders it provides them
 * through its `use-intl` provider. Later namespaces win, like the legacy merged map. Keep in sync with
 * `usePlayButtonTranslate`, which reads each one by position.
 */
export const gamePlayButtonNamespaces = [
  "Feature.GameLaunchGuestMode",
  "Common.VisitGame",
  "CommonUI.Controls",
  "Feature.ExperienceDetails",
  "Feature.DownloadLanding",
  "Feature.Build",
  "Feature.Friends",
] as const satisfies readonly Namespace[];
