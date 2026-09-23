export type ReferralEventParams = {
  name: string;
  type: string;
  context: string;
  params: Record<string, string>;
};

const referralEventNames = {
  referrerImpression: "plus_referral_dashboard_shown",
  referrerCopyClick: "plus_referral_copy_link_click",
  refereeImpression: "plus_referral_sheet_shown",
  refereeSubscribeClick: "plus_referral_subscribe_click",
  refereeDismissed: "plus_referral_sheet_dismissed",
} as const;

const CONTEXT = "plusReferral";

export const getReferralEventParams = {
  referrerImpression: (): ReferralEventParams => ({
    name: referralEventNames.referrerImpression,
    type: referralEventNames.referrerImpression,
    context: CONTEXT,
    params: {},
  }),
  referrerCopyClick: (): ReferralEventParams => ({
    name: referralEventNames.referrerCopyClick,
    type: referralEventNames.referrerCopyClick,
    context: CONTEXT,
    params: {},
  }),
  refereeImpression: (
    face: string,
    hasReferrerId: boolean,
    referrerId?: string,
    referralCode?: string,
  ): ReferralEventParams => ({
    name: referralEventNames.refereeImpression,
    type: referralEventNames.refereeImpression,
    context: CONTEXT,
    params: {
      face,
      hasReferrerId: String(hasReferrerId),
      ...(referrerId ? { referrerId } : {}),
      ...(referralCode ? { referralCode } : {}),
    },
  }),
  refereeSubscribeClick: (
    face: string,
    referrerId?: string,
    referralCode?: string,
  ): ReferralEventParams => ({
    name: referralEventNames.refereeSubscribeClick,
    type: referralEventNames.refereeSubscribeClick,
    context: CONTEXT,
    params: {
      face,
      ...(referrerId ? { referrerId } : {}),
      ...(referralCode ? { referralCode } : {}),
    },
  }),
  refereeDismissed: (
    face: string,
    referrerId?: string,
    referralCode?: string,
  ): ReferralEventParams => ({
    name: referralEventNames.refereeDismissed,
    type: referralEventNames.refereeDismissed,
    context: CONTEXT,
    params: {
      face,
      ...(referrerId ? { referrerId } : {}),
      ...(referralCode ? { referralCode } : {}),
    },
  }),
};
