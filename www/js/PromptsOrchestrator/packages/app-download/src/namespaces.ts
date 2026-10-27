import type { Namespace } from "@rbx/www-common/i18n";

/** The namespaces app-download's keys come from; every entry that renders its components provides them. */
export const appDownloadNamespaces = [
  "Feature.DownloadLanding",
  "Common.VisitGame",
] as const satisfies readonly Namespace[];

/**
 * The namespaces DownloadDialog's keys come from: the gameLaunch component's list, so lookups match
 * the legacy merged map. Later entries win, as they did there.
 */
export const downloadDialogNamespaces = [
  "Feature.GameLaunchGuestMode",
  "Common.VisitGame",
  "CommonUI.Controls",
  "Feature.ExperienceDetails",
  "Feature.DownloadLanding",
] as const satisfies readonly Namespace[];

/** The namespaces LaunchFailureDialog's keys come from. */
export const launchFailureDialogNamespaces = [
  "Common.VisitGame",
  "CommonUI.Controls",
] as const satisfies readonly Namespace[];
