import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";

import { getReferralEventParams } from "./referralEventConstants";

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
};

export default referralEventService;
