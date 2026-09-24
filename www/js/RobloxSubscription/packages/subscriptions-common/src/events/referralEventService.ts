import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";

import { getReferralEventParams } from "./referralEventConstants";
import { trackCounter } from "../utils/trackCounter";

import type { ReferralEventParams } from "./referralEventConstants";

const send = (eventParams: ReferralEventParams): void => {
  sendEventWithTarget(eventParams.type, eventParams.context, eventParams.params);
};

const referralEventService = {
  referrerImpression: (): void => {
    try {
      send(getReferralEventParams.referrerImpression());
    } catch {
      // Event failures must not break the UI.
    }
  },
  referrerCopyClick: (): void => {
    try {
      send(getReferralEventParams.referrerCopyClick());
    } catch {
      // Event failures must not break the UI.
    }
  },
  refereeImpression: (
    face: string,
    hasReferrerId: boolean,
    referrerId?: string,
    referralCode?: string,
  ): void => {
    try {
      send(getReferralEventParams.refereeImpression(face, hasReferrerId, referrerId, referralCode));
    } catch {
      // Event failures must not break the UI.
    }
  },
  refereeSubscribeClick: (face: string, referrerId?: string, referralCode?: string): void => {
    try {
      send(getReferralEventParams.refereeSubscribeClick(face, referrerId, referralCode));
    } catch {
      // Event failures must not break the UI.
    }
  },
  refereeDismissed: (face: string, referrerId?: string, referralCode?: string): void => {
    try {
      send(getReferralEventParams.refereeDismissed(face, referrerId, referralCode));
    } catch {
      // Event failures must not break the UI.
    }
  },
  flyoutShareImpression: (): void => {
    try {
      send(getReferralEventParams.flyoutShareImpression());
      trackCounter("FlyoutShareShown");
    } catch {
      // Event failures must not break the UI.
    }
  },
  flyoutShareClick: (): void => {
    try {
      send(getReferralEventParams.flyoutShareClick());
      trackCounter("FlyoutShareClick");
    } catch {
      // Event failures must not break the UI.
    }
  },
  flyoutJoinImpression: (referrerId?: string): void => {
    try {
      send(getReferralEventParams.flyoutJoinImpression(referrerId));
      trackCounter("FlyoutJoinShown", { hasReferrerId: String(!!referrerId) });
    } catch {
      // Event failures must not break the UI.
    }
  },
  flyoutJoinClick: (referrerId?: string): void => {
    try {
      send(getReferralEventParams.flyoutJoinClick(referrerId));
      trackCounter("FlyoutJoinClick", { hasReferrerId: String(!!referrerId) });
    } catch {
      // Event failures must not break the UI.
    }
  },
  flyoutUpsellImpression: (): void => {
    try {
      send(getReferralEventParams.flyoutUpsellImpression());
      trackCounter("FlyoutUpsellShown");
    } catch {
      // Event failures must not break the UI.
    }
  },
  flyoutUpsellClick: (): void => {
    try {
      send(getReferralEventParams.flyoutUpsellClick());
      trackCounter("FlyoutUpsellClick");
    } catch {
      // Event failures must not break the UI.
    }
  },
  shareCardImpression: (): void => {
    try {
      send(getReferralEventParams.shareCardImpression());
      trackCounter("ShareCardShown");
    } catch {
      // Event failures must not break the UI.
    }
  },
  shareCardInviteClick: (): void => {
    try {
      send(getReferralEventParams.shareCardInviteClick());
      trackCounter("ShareCardInviteClick");
    } catch {
      // Event failures must not break the UI.
    }
  },
};

export default referralEventService;
