import type { TChatConversation, TChatParticipant } from "../types/chat";
import { getCurrentUserId } from "./currentUser";

// Minimal shape of the `window.Roblox` globals used by the legacy (non-revamp) abuse-report path.
// Both are provided at runtime by the core Roblox script bundle. AbuseReportDispatcher is not part
// of the typed global `Roblox` surface (core-scripts globals.d.ts), so we read through this narrow
// runtime shape rather than the typed global.
type TRobloxAbuseReportGlobals = {
  Endpoints?: {
    getAbsoluteUrl?: (relativeUrl: string) => string;
  };
  AbuseReportDispatcher?: {
    triggerUrlAction?: (url: string) => void;
  };
};

const getRobloxGlobals = (): TRobloxAbuseReportGlobals =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- runtime-only Roblox globals not on the typed surface
  (window as unknown as { Roblox?: TRobloxAbuseReportGlobals }).Roblox ?? {};

/**
 * Revamp abuse-report URL: the new /report-abuse/ flow. Signature is relied on by App.test.tsx.
 */
export const getReportUrl = (conversation: TChatConversation, participant: TChatParticipant) => {
  const params = new URLSearchParams({
    targetId: String(participant.id),
    submitterId: String(getCurrentUserId() ?? ""),
    abuseVector: "web_chat",
    custom: JSON.stringify({
      conversationId: conversation.id,
    }),
  });

  return `/report-abuse/?${params.toString()}`;
};

/**
 * Legacy (non-revamp) abuse-report URL: /abusereport/chat, parity with the legacy Angular
 * chatLayout.abuseReportUrl template `/abusereport/chat?id={userId}&redirectUrl={location}
 * &conversationId={conversationId}`.
 */
export const getLegacyAbuseReportUrl = (
  conversation: TChatConversation,
  participant: TChatParticipant,
) => {
  const params = new URLSearchParams({
    id: String(participant.id),
    redirectUrl: window.location.href,
    conversationId: conversation.id,
  });

  return `/abusereport/chat?${params.toString()}`;
};

type TNavigateAbuseReportArgs = {
  revampEnabled: boolean;
  conversation: TChatConversation;
  participant: TChatParticipant;
};

/**
 * Navigates to the abuse-report destination, mirroring the legacy dialogController.abuseReport
 * branch:
 *  - revamp enabled → navigate to the /report-abuse/ flow.
 *  - revamp disabled → build the legacy /abusereport/chat URL, absolutize via Roblox.Endpoints,
 *    then hand off to Roblox.AbuseReportDispatcher.triggerUrlAction when present, else navigate
 *    directly.
 */
export const navigateAbuseReport = ({
  revampEnabled,
  conversation,
  participant,
}: TNavigateAbuseReportArgs): void => {
  if (revampEnabled) {
    window.location.href = getReportUrl(conversation, participant);
    return;
  }

  const relativeUrl = getLegacyAbuseReportUrl(conversation, participant);
  const { Endpoints, AbuseReportDispatcher } = getRobloxGlobals();
  const url = Endpoints?.getAbsoluteUrl?.(relativeUrl) ?? relativeUrl;

  if (AbuseReportDispatcher?.triggerUrlAction) {
    AbuseReportDispatcher.triggerUrlAction(url);
  } else {
    window.location.href = url;
  }
};
