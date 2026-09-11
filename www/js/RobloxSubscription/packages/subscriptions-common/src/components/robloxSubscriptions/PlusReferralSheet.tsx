import { PeriodType } from "@rbx/client-subscriptions-api/v1";
import { isReferralEnabled } from "@rbx/core-scripts/meta/subscription";
import { TranslationProvider, useTranslation } from "@rbx/core-scripts/react";
import plusRobuxDark from "@rbx/foundation-images/pictograms/plus_robux_dark.svg";
import plusRobuxLight from "@rbx/foundation-images/pictograms/plus_robux_light.svg";
import {
  Button,
  Icon,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetRoot,
  SheetTitle,
} from "@rbx/foundation-ui";
import { translateHtml } from "@rbx/translation-utils";
import { useMemo } from "react";

import BenefitList from "./BenefitList";
import { useCreateSubscriptionReferral } from "../../hooks/useCreateSubscriptionReferral";
import useLocalizedMoney from "../../hooks/useLocalizedMoney";
import { usePlusSubscribeProduct } from "../../hooks/usePlusSubscribeProduct";
import { useReferralEligibility } from "../../hooks/useReferralEligibility";
import { useReferrerHandle } from "../../hooks/useReferrerHandle";
import { REFERRAL_REWARD_ROBUX, SUBSCRIPTION_TERMS_URL } from "../../subscriptionConstants";
import SubscriptionButton from "../shared/SubscriptionButton";

import type { PlusSubscribeButtonProps } from "../../hooks/usePlusSubscribeProduct";
import type {
  Money,
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionOffer,
} from "@rbx/client-subscriptions-api/v1";
import type { FC, ReactNode } from "react";

const REFERRAL_TRANSLATION_CONFIG = ["Feature.RobloxSubscription"] as const;

/**
 * Full 320x180 canvas, centred, per the referral Figma. Anything smaller shrinks the artwork
 * inside it, which sits well within the canvas edges.
 */
const PICTOGRAM_CLASS = "margin-x-auto width-full max-width-[320px]";

/**
 * The Figma leaves 24px between the artwork and the heading, but the artwork stops 16.5px short of
 * the canvas bottom, so the 16px body gap alone would read as 32.5px. Trims the difference.
 */
const PICTOGRAM_GAP_CLASS = "margin-bottom-[-8px]";

/** Stands in while the product loads, so `useLocalizedMoney` runs on every render. */
const EMPTY_PRICE: Money = { currencyCode: "USD", units: 0, nanos: 0 };

/**
 * Which face the sheet is showing. `pitch` sells the invite; the rest explain why there is nothing
 * to redeem and fall back to a plain Plus upsell.
 */
type PlusReferralSheetFace = "pitch" | "invalid" | "ineligible";

/**
 * One entry per verdict that cannot be redeemed, so a new verdict is a row here rather than
 * another branch in the render.
 */
const UNREDEEMABLE_COPY: Record<
  Exclude<PlusReferralSheetFace, "pitch">,
  { key: string; fallback: string }
> = {
  invalid: {
    key: "Description.ReferralInvalid",
    fallback:
      "This referral link is no longer valid. You can still join Roblox Plus without the referral reward.",
  },
  // A live link this visitor cannot redeem, e.g. they already subscribe. Blaming the link would
  // send them looking for a new one that fails the same way.
  ineligible: {
    key: "Description.ReferralIneligible",
    fallback:
      "This referral reward is not available on your account. You can still join Roblox Plus.",
  },
};

/**
 * Membership page url carrying the referral, so checkout returns to a landing that still knows
 * about it. `readPlusReferralLanding` reads these names back off the url.
 */
const buildPlusReferralReturnUrl = (code: string, referrerId: string | undefined): string => {
  const params = new URLSearchParams({ ctx: "plus_referral", referralCode: code });
  if (referrerId) {
    params.set("referrerId", referrerId);
  }
  return `/plus?${params.toString()}`;
};

export type PlusReferralInvite = {
  /** Referral link code, when the surface has one. */
  code?: string;
  /** Referrer's user id, e.g. v2 resolve `targetId` or `senderUserId`. */
  referrerId?: string;
};

export type PlusReferralSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit for a referral that already failed to resolve — that goes straight to the invalid face. */
  invite?: PlusReferralInvite;
  /**
   * Checkout wiring from the surrounding page. `/plus` has the product loaded and passes it down;
   * anywhere else omits it and the sheet looks the product up itself.
   */
  subscribeButtonProps?: PlusSubscribeButtonProps;
  /** Localized price from the surrounding product, quoted above the benefits. */
  subscribePrice?: Money;
  /** Billing period of the surrounding product, which the price line labels itself with. */
  subscribePeriodType?: PeriodType;
  /** Feature config of that same product, listing the benefits the pitch face shows. */
  subscribeFeatureConfig?: RobloxSubscriptionProductFeatureConfig;
  /** Offers from that product, used to select the correct subscription terms. */
  subscribeEligibleOffers?: SubscriptionOffer[];
};

type PlusReferralSheetBodyProps = {
  face: PlusReferralSheetFace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralCode?: string;
  referrerUserId?: string;
  subscribeButtonProps: PlusSubscribeButtonProps;
  subscribePrice?: Money;
  subscribePeriodType?: PeriodType;
  featureConfig?: RobloxSubscriptionProductFeatureConfig;
};

/**
 * The sheet itself. Split out only because `TranslationProvider` has to wrap whatever calls
 * `useTranslation`, which a single component cannot do for itself.
 */
const PlusReferralSheetBody: FC<PlusReferralSheetBodyProps> = ({
  face,
  open,
  onOpenChange,
  referralCode,
  referrerUserId,
  subscribeButtonProps,
  subscribePrice,
  subscribePeriodType,
  featureConfig,
}) => {
  const { translate, intl } = useTranslation();
  const isPitch = face === "pitch";
  const rewardAmount = intl.n(REFERRAL_REWARD_ROBUX);
  // Hooks cannot be skipped, so format a placeholder and gate the rendering on the real price.
  const formattedPrice = useLocalizedMoney(subscribePrice ?? EMPTY_PRICE);
  // Only the pitch names the referrer, so the other faces never spend a users api request.
  const { handle: referrerHandle, isLoading: isReferrerLoading } = useReferrerHandle(
    isPitch ? referrerUserId : undefined,
  );

  const joinHeading = translate("Heading.ReferralRecipientJoin", undefined, "Join Plus, get");
  const joinPlusLabel = translate("Action.ReferralJoinPlus", undefined, "Join Roblox Plus");
  // Matches the wording `Description.SubscriptionLegal` quotes, which every other subscribe
  // surface relies on. Labelling this with the price instead left the legal line contradicting it.
  const subscribeLabel = translate("Action.Subscribe", undefined, "Subscribe");

  // Carry the referral back to /plus after checkout so the landing can confirm the invite.
  const checkoutProps = useMemo(() => {
    const referralReturnUrl =
      referralCode !== undefined
        ? buildPlusReferralReturnUrl(referralCode, referrerUserId)
        : undefined;

    return {
      ...subscribeButtonProps,
      redirectUrl: subscribeButtonProps.redirectUrl ?? referralReturnUrl,
      referrerId: subscribeButtonProps.referrerId ?? referrerUserId,
    };
  }, [referralCode, referrerUserId, subscribeButtonProps]);

  const termsLink = [
    {
      opening: "linkStart",
      closing: "linkEnd",
      render: (children: ReactNode) => (
        <a
          className="content-link underline"
          href={SUBSCRIPTION_TERMS_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          {children}
        </a>
      ),
    },
  ];

  return (
    <SheetRoot open={open} onOpenChange={onOpenChange}>
      <SheetContent
        centerSheetSize="Medium"
        // `SheetActions` always renders a `Divider` ahead of the action row with no prop to opt
        // out, and it is a sibling of the element `SheetActions` styles, so hide it from here.
        className={isPitch ? "[&>[role=separator]]:[display:none]" : undefined}
        closeLabel={translate("Action.Close")}
        largeScreenVariant="center"
      >
        {/* The body carries the message, so the header only names the sheet for a11y. */}
        <SheetTitle visuallyHideTitleText>
          {isPitch ? `${joinHeading} ${rewardAmount}` : joinPlusLabel}
        </SheetTitle>

        {face === "pitch" ? (
          // 16px between every body section, per the referral Figma.
          <SheetBody className="gap-y-large padding-top-small padding-bottom-small medium:padding-top-medium medium:padding-bottom-medium flex flex-col">
            {/* Foundation ships one pictogram per theme rather than a themeable component. */}
            <img
              alt=""
              className={`${PICTOGRAM_CLASS} ${PICTOGRAM_GAP_CLASS} dark:hidden`}
              src={plusRobuxLight}
            />
            <img
              alt=""
              className={`${PICTOGRAM_CLASS} ${PICTOGRAM_GAP_CLASS} hidden dark:block`}
              src={plusRobuxDark}
            />

            <div className="gap-y-medium text-align-x-left flex flex-col items-start">
              {/*
               * Inline, not `font-builder-extended`: two of the four components rendering this
               * sheet never declare that class, and `medium:text-heading-medium` would outrank it
               * anyway since `font` is a shorthand and its media query compiles last.
               */}
              <div
                className="text-heading-small medium:text-heading-medium content-emphasis margin-none gap-x-xsmall flex flex-wrap items-center justify-start"
                style={{ fontFamily: '"Builder Extended", "Builder Sans", sans-serif' }}
              >
                {joinHeading}
                <span className="gap-x-xsmall inline-flex items-center">
                  <Icon name="icon-regular-robux" size="Large" />
                  {rewardAmount}
                </span>
              </div>
              {isReferrerLoading ? (
                // Hold the line until the handle resolves so it does not pop in late.
                <div className="bg-shift-100 radius-medium height-[40px] width-full" />
              ) : referrerHandle ? (
                <p className="text-body-small medium:text-body-medium content-default margin-none">
                  {translate(
                    "Description.ReferralRecipientInvitedBy",
                    { displayName: referrerHandle, amount: rewardAmount },
                    `${referrerHandle} invited you to join Plus. You'll both get ${rewardAmount} Robux when you join.`,
                  )}
                </p>
              ) : null}
            </div>

            {subscribePrice && (
              <p className="text-title-medium content-emphasis margin-none">
                {translate("Action.PricePerMonth", {
                  price: formattedPrice,
                  // The string keys its period suffix on this, so a missing one renders unresolved.
                  periodType: subscribePeriodType ?? PeriodType.Month,
                })}
              </p>
            )}

            {featureConfig && (
              <BenefitList
                // Same trim the upsell modal applies, keeping the pitch to the benefits both list.
                featureConfig={{
                  ...featureConfig,
                  isTradingEnabled: false,
                  isUgcPublishingEnabled: false,
                }}
                periodType={subscribePeriodType ?? PeriodType.Month}
              />
            )}
          </SheetBody>
        ) : (
          <SheetBody className="gap-y-large padding-top-large padding-bottom-medium medium:padding-top-xlarge medium:padding-bottom-large flex flex-col items-center text-center">
            <Icon
              className="content-emphasis !size-1800 medium:!size-2200"
              name="icon-regular-triangle-exclamation"
              size="XLarge"
            />
            <p className="text-body-small medium:text-body-medium content-emphasis margin-none">
              {translate(UNREDEEMABLE_COPY[face].key, undefined, UNREDEEMABLE_COPY[face].fallback)}
            </p>
          </SheetBody>
        )}

        {isPitch ? (
          <SheetActions>
            <div className="gap-y-medium width-full flex flex-col">
              <SubscriptionButton
                {...checkoutProps}
                className="width-full"
                size="Large"
                variant="Emphasis"
              >
                {subscribeLabel}
              </SubscriptionButton>
              {/* No free-trial variant: this sheet always sells at the recurring price, so trial
                  terms would describe an offer the CTA never makes. */}
              <span className="text-caption-medium content-muted">
                {translateHtml(translate, "Description.SubscriptionLegal", termsLink)}
              </span>
            </div>
          </SheetActions>
        ) : (
          <SheetActions className="gap-y-small flex flex-col">
            <SubscriptionButton
              {...subscribeButtonProps}
              className="width-full"
              size="Large"
              variant="Emphasis"
            >
              {joinPlusLabel}
            </SubscriptionButton>
            <Button
              className="width-full"
              size="Large"
              variant="Standard"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              {translate("Action.Cancel", undefined, "Cancel")}
            </Button>
          </SheetActions>
        )}
      </SheetContent>
    </SheetRoot>
  );
};

/**
 * The referral sheet a recipient gets, in whichever state the invite resolves to.
 *
 * Shared by both entry points: the sheet that opens in place from the nav and Buy Robux, and the
 * one that opens from referral params in the url.
 */
const PlusReferralSheet: FC<PlusReferralSheetProps> = ({
  open,
  onOpenChange,
  invite,
  subscribeButtonProps,
  subscribePrice,
  subscribePeriodType,
  subscribeFeatureConfig,
  subscribeEligibleOffers,
}) => {
  // Off the rollout the link still gets an answer — the invalid face — rather than doing nothing.
  const isActionableInvite = invite !== undefined && isReferralEnabled();

  // Resolving the share link only proved it parses. Only this check says whether this visitor can
  // accept the referral.
  const { eligibility, isLoading: isEligibilityLoading } = useReferralEligibility({
    referrerId: invite?.referrerId,
    enabled: isActionableInvite,
  });

  const {
    subscribeButtonProps: lookedUpSubscribeProps,
    subscribePrice: lookedUpSubscribePrice,
    subscribePeriodType: lookedUpSubscribePeriodType,
    subscribeFeatureConfig: lookedUpSubscribeFeatureConfig,
    isLoading: isProductLoading,
  } = usePlusSubscribeProduct({
    // The benefit list needs a feature config as much as the CTA needs checkout, so a surface that
    // hands down one but not the other still sends us looking for the rest. Not gated on `open`:
    // this renders nothing until the product lands, so waiting for the click delayed the sheet.
    enabled:
      subscribeButtonProps === undefined ||
      subscribePrice === undefined ||
      subscribeFeatureConfig === undefined ||
      subscribeEligibleOffers === undefined,
  });
  const resolvedSubscribeProps = subscribeButtonProps ?? lookedUpSubscribeProps;
  const resolvedSubscribePrice = subscribePrice ?? lookedUpSubscribePrice;
  // Pair the period with whichever price won, so the quote never carries another product's period.
  const resolvedSubscribePeriodType =
    subscribePrice !== undefined ? subscribePeriodType : lookedUpSubscribePeriodType;
  const resolvedSubscribeFeatureConfig = subscribeFeatureConfig ?? lookedUpSubscribeFeatureConfig;

  // Only a share code proves the visitor came through a link. The nav and pending-referrals
  // entries already hold a referral, and recording from there would reset it.
  useCreateSubscriptionReferral({
    referrerId: invite?.referrerId,
    enabled: isActionableInvite && invite.code !== undefined && eligibility === "Eligible",
  });

  // Showing a sheet now would pitch the invite and then swap it for a rejection.
  if (isEligibilityLoading) {
    return null;
  }

  // Only an explicit verdict redeems. An unanswered check — failed request, off-contract value, or
  // no referrer to ask about — cannot promise the reward, so it reads as a dead link.
  const face: PlusReferralSheetFace =
    isActionableInvite && eligibility === "Eligible"
      ? "pitch"
      : eligibility === "Ineligible"
        ? "ineligible"
        : "invalid";

  // Only the pitch quotes a price and lists benefits. A surface that already holds checkout and
  // lands on a fallback face has everything it needs, so it should not wait on the lookup.
  if (face === "pitch" && isProductLoading) {
    return null;
  }

  // Every face here ends in a subscribe CTA, so without checkout there is nothing to show.
  if (resolvedSubscribeProps === undefined) {
    return null;
  }

  return (
    <TranslationProvider config={[...REFERRAL_TRANSLATION_CONFIG]}>
      <PlusReferralSheetBody
        face={face}
        featureConfig={resolvedSubscribeFeatureConfig}
        open={open}
        referralCode={invite?.code}
        referrerUserId={invite?.referrerId}
        subscribeButtonProps={resolvedSubscribeProps}
        subscribePeriodType={resolvedSubscribePeriodType}
        subscribePrice={resolvedSubscribePrice}
        onOpenChange={onOpenChange}
      />
    </TranslationProvider>
  );
};

export default PlusReferralSheet;
