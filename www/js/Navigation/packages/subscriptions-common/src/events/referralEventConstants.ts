export type ReferralEventParams = {
  name: string;
  type: string;
  context: string;
  params: Record<string, string>;
};

export enum PlusReferralSurface {
  BuyRobuxPage = "buyRobuxPage",
  Flyout = "flyout",
  DirectUrl = "directUrl",
}

const referralEventNames = {
  referrerImpression: "plus_referral_dashboard_shown",
  referrerCopyClick: "plus_referral_copy_link_click",
  refereeImpression: "plus_referral_sheet_shown",
  refereeSubscribeClick: "plus_referral_subscribe_click",
  refereeDismissed: "plus_referral_sheet_dismissed",
  flyoutShareImpression: "plus_referral_flyout_share_shown",
  flyoutShareClick: "plus_referral_flyout_share_click",
  flyoutJoinImpression: "plus_referral_flyout_join_shown",
  flyoutJoinClick: "plus_referral_flyout_join_click",
  flyoutUpsellImpression: "plus_referral_flyout_upsell_shown",
  flyoutUpsellClick: "plus_referral_flyout_upsell_click",
  shareCardImpression: "plus_referral_share_card_shown",
  shareCardInviteClick: "plus_referral_share_card_invite_click",
  buyRobuxReferralImpression: "plus_referral_buy_robux_shown",
  buyRobuxReferralReviewClick: "plus_referral_buy_robux_review_click",
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
    surface?: PlusReferralSurface,
  ): ReferralEventParams => ({
    name: referralEventNames.refereeImpression,
    type: referralEventNames.refereeImpression,
    context: CONTEXT,
    params: {
      face,
      hasReferrerId: String(hasReferrerId),
      ...(referrerId ? { referrerId } : {}),
      ...(referralCode ? { referralCode } : {}),
      ...(surface ? { surface } : {}),
    },
  }),
  refereeSubscribeClick: (
    face: string,
    referrerId?: string,
    referralCode?: string,
    surface?: PlusReferralSurface,
  ): ReferralEventParams => ({
    name: referralEventNames.refereeSubscribeClick,
    type: referralEventNames.refereeSubscribeClick,
    context: CONTEXT,
    params: {
      face,
      ...(referrerId ? { referrerId } : {}),
      ...(referralCode ? { referralCode } : {}),
      ...(surface ? { surface } : {}),
    },
  }),
  refereeDismissed: (
    face: string,
    referrerId?: string,
    referralCode?: string,
    surface?: PlusReferralSurface,
  ): ReferralEventParams => ({
    name: referralEventNames.refereeDismissed,
    type: referralEventNames.refereeDismissed,
    context: CONTEXT,
    params: {
      face,
      ...(referrerId ? { referrerId } : {}),
      ...(referralCode ? { referralCode } : {}),
      ...(surface ? { surface } : {}),
    },
  }),
  flyoutShareImpression: (): ReferralEventParams => ({
    name: referralEventNames.flyoutShareImpression,
    type: referralEventNames.flyoutShareImpression,
    context: CONTEXT,
    params: {},
  }),
  flyoutShareClick: (): ReferralEventParams => ({
    name: referralEventNames.flyoutShareClick,
    type: referralEventNames.flyoutShareClick,
    context: CONTEXT,
    params: {},
  }),
  flyoutJoinImpression: (referrerId?: string): ReferralEventParams => ({
    name: referralEventNames.flyoutJoinImpression,
    type: referralEventNames.flyoutJoinImpression,
    context: CONTEXT,
    params: {
      ...(referrerId ? { referrerId } : {}),
    },
  }),
  flyoutJoinClick: (referrerId?: string): ReferralEventParams => ({
    name: referralEventNames.flyoutJoinClick,
    type: referralEventNames.flyoutJoinClick,
    context: CONTEXT,
    params: {
      ...(referrerId ? { referrerId } : {}),
    },
  }),
  flyoutUpsellImpression: (): ReferralEventParams => ({
    name: referralEventNames.flyoutUpsellImpression,
    type: referralEventNames.flyoutUpsellImpression,
    context: CONTEXT,
    params: {},
  }),
  flyoutUpsellClick: (): ReferralEventParams => ({
    name: referralEventNames.flyoutUpsellClick,
    type: referralEventNames.flyoutUpsellClick,
    context: CONTEXT,
    params: {},
  }),
  shareCardImpression: (): ReferralEventParams => ({
    name: referralEventNames.shareCardImpression,
    type: referralEventNames.shareCardImpression,
    context: CONTEXT,
    params: {},
  }),
  shareCardInviteClick: (): ReferralEventParams => ({
    name: referralEventNames.shareCardInviteClick,
    type: referralEventNames.shareCardInviteClick,
    context: CONTEXT,
    params: {},
  }),
  buyRobuxReferralImpression: (referrerId?: string, referralId?: number): ReferralEventParams => ({
    name: referralEventNames.buyRobuxReferralImpression,
    type: referralEventNames.buyRobuxReferralImpression,
    context: CONTEXT,
    params: {
      ...(referrerId ? { referrerId } : {}),
      ...(referralId !== undefined ? { referralId: String(referralId) } : {}),
    },
  }),
  buyRobuxReferralReviewClick: (referrerId?: string, referralId?: number): ReferralEventParams => ({
    name: referralEventNames.buyRobuxReferralReviewClick,
    type: referralEventNames.buyRobuxReferralReviewClick,
    context: CONTEXT,
    params: {
      ...(referrerId ? { referrerId } : {}),
      ...(referralId !== undefined ? { referralId: String(referralId) } : {}),
    },
  }),
};
