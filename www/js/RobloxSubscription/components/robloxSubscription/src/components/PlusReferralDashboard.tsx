import { isAuthenticated } from "@rbx/core-scripts/meta/user";
import { TranslationProvider, useTranslation } from "@rbx/core-scripts/react";
import sharePlusDark from "@rbx/foundation-images/pictograms/share_plus_dark.svg";
import sharePlusLight from "@rbx/foundation-images/pictograms/share_plus_light.svg";
import { Button, Icon, ListItem, TextInput } from "@rbx/foundation-ui";
import { PlusReferralSheet, REFERRAL_REWARD_ROBUX, translateHtml } from "@rbx/subscriptions-common";
import { useCallback, useEffect, useRef, useState } from "react";

import { subscriptionsV2Api } from "../clients/subscriptions";
import { useReferralShareLink } from "../hooks/useReferralShareLink";

import type { GetRobloxPlusUserBenefitsResponse } from "@rbx/client-roblox-subscriptions-api/v1";
import type { SubscriptionButtonProps } from "@rbx/subscriptions-common";
import type { FC, ReactNode } from "react";

const REFERRAL_TRANSLATION_CONFIG = ["Feature.RobloxSubscription"] as const;

const COPIED_LABEL_DURATION_MS = 2000;

/**
 * Full 320x180 canvas, centred, per the referral Figma. Anything smaller shrinks the artwork
 * inside it, which sits well within the canvas edges.
 */
const PICTOGRAM_CLASS = "margin-x-auto width-full max-width-[320px]";

/**
 * The artwork stops 16.5px short of the canvas bottom, and the heading below carries its own
 * leading, so the column gap reads far wider here than between the sections underneath. Cancels
 * both rather than shrinking the column gap, which also spaces every other section.
 */
const PICTOGRAM_GAP_CLASS = "margin-bottom-[-32px]";

const REFERRAL_TERMS_URL = "https://en.help.roblox.com/hc/en-us/articles/52737229124628";

/**
 * Wraps whatever the translated string places between the two markers. Keeping the link phrase in
 * the string rather than concatenating around it lets each locale put it where its grammar wants.
 */
const REFERRAL_TERMS_LINK = [
  {
    opening: "linkStart",
    closing: "linkEnd",
    render: (children: ReactNode) => (
      <a className="underline" href={REFERRAL_TERMS_URL} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    ),
  },
];

/**
 * Content column shared by the body and the action bar. Max-width matches other Roblox Plus
 * surfaces — widen at breakpoints rather than stretching edge-to-edge.
 */
const CONTENT_COLUMN_CLASS =
  "padding-x-xlarge margin-x-auto width-full medium:max-width-[600px] large:max-width-[730px] xlarge:max-width-[840px]";

/**
 * Fixed 200px so the button does not resize between "Copy link" and "Link copied". `shrink-0`
 * keeps the link field, not the button, absorbing a long URL.
 */
const COPY_BUTTON_WIDTH_CLASS = "width-[200px] shrink-0";

/**
 * Cancels the bottom margin `ViewContainer` gives every view so its content clears the site
 * footer. This page hides that footer, so the margin would read as an empty band under Copy link.
 *
 * Mirrors `ViewContainer`'s own pair, which must stay in step: 160px, dropping to 120px from the
 * `large` variant up. Note that Foundation's variant names sit one step below its token names, so
 * `large:` is `min-width: 1141px` rather than the 1520px `--breakpoint-large` would suggest —
 * reusing the variant rather than a hand-written query keeps the two aligned either way.
 */
const WRAPPER_MARGIN_CANCEL_CLASS = "margin-bottom-[-160px] large:margin-bottom-[-120px]";

/**
 * Two per row on phones, so a third card wraps below. From medium up every card shares one row, so
 * the column count follows the card count — an empty third column would narrow the other two.
 */
const STATS_GRID_CLASS = "[grid-template-columns:repeat(2,minmax(0,1fr))]";
const STATS_GRID_CLASS_BY_CARD_COUNT: Record<number, string> = {
  2: "medium:[grid-template-columns:repeat(2,minmax(0,1fr))]",
  3: "medium:[grid-template-columns:repeat(3,minmax(0,1fr))]",
};

type GateStatus = "loading" | "ready" | "invalid";

export type PlusReferralDashboardProps = {
  onClose: () => void;
  /**
   * The benefits payload the Plus page already holds. Passed in rather than fetched here so the
   * referral totals and the savings cards share one lookup, the same way `SubscriberView` takes it.
   */
  robloxPlusUserBenefits: GetRobloxPlusUserBenefitsResponse | undefined;
  /** Join Plus CTA props for when create-link fails, i.e. an ineligible referrer. */
  subscribeButtonProps: Omit<
    SubscriptionButtonProps,
    "variant" | "size" | "className" | "children"
  >;
};

type StatCard = {
  key: string;
  label: string;
  value: ReactNode;
  /** Robux totals carry the currency glyph; counts do not. */
  hasRobuxIcon?: boolean;
};

type StatsCardsProps = {
  robuxEarned?: number;
  referralCount?: number;
  /** Robux from referrals still inside the payout hold period. */
  pendingRobux?: number;
};

const StatsCards: FC<StatsCardsProps> = ({ robuxEarned, referralCount, pendingRobux }) => {
  const { translate, intl } = useTranslation();

  // Dash until the lookup lands, and after one that failed, matching `SavingsDashboard` above it.
  const renderStat = (value: number | undefined): ReactNode =>
    value === undefined ? "—" : intl.n(value);

  const cards: StatCard[] = [
    {
      key: "successful-referrals",
      label: translate("Label.SuccessfulReferrals", undefined, "Successful referrals"),
      value: renderStat(referralCount),
    },
    {
      key: "robux-earned",
      hasRobuxIcon: true,
      label: translate("Label.RobuxEarned", undefined, "Robux earned"),
      value: renderStat(robuxEarned),
    },
  ];

  // The card earns its slot only when something is pending. An unknown total counts as nothing
  // pending rather than showing a dash.
  if (pendingRobux !== undefined && pendingRobux > 0) {
    cards.push({
      key: "pending-robux",
      hasRobuxIcon: true,
      label: translate("Label.PendingRobux", undefined, "Pending Robux"),
      value: renderStat(pendingRobux),
    });
  }

  return (
    <div className="width-full gap-y-medium flex flex-col">
      <h2 className="text-heading-small content-emphasis margin-none">
        {translate("Heading.ReferralHistory", undefined, "Referral history")}
      </h2>
      <div
        className={`${STATS_GRID_CLASS} ${STATS_GRID_CLASS_BY_CARD_COUNT[cards.length] ?? ""} width-full gap-medium grid`}
        data-testid="plus-referral-stats-cards"
      >
        {cards.map(({ key, label, value, hasRobuxIcon }) => (
          <div
            key={key}
            className="padding-medium gap-xsmall bg-shift-100 radius-medium min-width-0 flex flex-col"
          >
            <span className="text-title-medium content-muted">{label}</span>
            <span className="text-heading-small content-emphasis gap-x-xsmall flex items-center">
              {hasRobuxIcon ? <Icon name="icon-regular-robux" size="Small" /> : null}
              {value}
            </span>
          </div>
        ))}
      </div>
      <span className="text-caption-medium content-muted">
        {/* Shared with the savings dashboard, which states the same delay under its stats grid. */}
        {translate("Description.SavingsDataDelay")}
      </span>
    </div>
  );
};

type RewardRowProps = {
  label: string;
  amount: string;
  description: string;
};

const RewardRow: FC<RewardRowProps> = ({ label, amount, description }) => (
  <div className="flex flex-col">
    <span className="text-title-large large:text-heading-small content-emphasis">{label}</span>
    <ListItem
      // `isContained` insets the row, which would step it in from the label above it.
      className="padding-x-none"
      description={description}
      divider="None"
      isContained
      leading={
        <span className="bg-shift-200 radius-circle size-1000 large:size-1200 flex items-center justify-center">
          <Icon className="large:!size-600" name="icon-regular-robux" size="Large" />
        </span>
      }
      size="Medium"
      title={amount}
    />
  </div>
);

type DashboardBodyProps = {
  /**
   * Link the gate already minted. Spending one create-link per open rather than two, and showing
   * the url that actually passed the gate.
   */
  shareUrl?: string;
  robloxPlusUserBenefits: GetRobloxPlusUserBenefitsResponse | undefined;
};

/**
 * The dashboard itself. Split from the exported component only because `TranslationProvider` has
 * to wrap whatever calls `useTranslation`, which one component cannot do for itself.
 */
const DashboardBody: FC<DashboardBodyProps> = ({
  shareUrl: knownShareUrl,
  robloxPlusUserBenefits,
}) => {
  const { translate, intl } = useTranslation();
  const {
    shareUrl: lookedUpShareUrl,
    isLoading: isShareUrlLoading,
    error: shareUrlError,
  } = useReferralShareLink({ enabled: knownShareUrl === undefined });
  const shareUrl = knownShareUrl ?? lookedUpShareUrl;
  const [didCopy, setDidCopy] = useState(false);
  const copiedTimeoutRef = useRef<number>();

  useEffect(
    () => () => {
      window.clearTimeout(copiedTimeoutRef.current);
    },
    [],
  );

  // StyleGuide still reserves footer room on `body` and `.container-main` after the footer is
  // hidden, which shows up as a blank band under Copy link. Restored on unmount, since dismissing
  // can return to the Plus landing without a page load.
  useEffect(() => {
    const footer = document.getElementById("footer-container");
    const containerMain = document.querySelector<HTMLElement>(".container-main");
    const footerDisplay = footer?.style.display;
    const bodyMarginBottom = document.body.style.marginBottom;
    const containerPaddingBottom = containerMain?.style.paddingBottom;
    const containerMinHeight = containerMain?.style.minHeight;

    if (footer) {
      footer.style.display = "none";
    }
    document.body.style.marginBottom = "0px";
    if (containerMain) {
      containerMain.style.paddingBottom = "0px";
      containerMain.style.minHeight = "0px";
    }

    return () => {
      if (footer) {
        footer.style.display = footerDisplay ?? "";
      }
      document.body.style.marginBottom = bodyMarginBottom;
      if (containerMain) {
        containerMain.style.paddingBottom = containerPaddingBottom ?? "";
        containerMain.style.minHeight = containerMinHeight ?? "";
      }
    };
  }, []);

  const handleCopy = useCallback(() => {
    if (!shareUrl) {
      return;
    }
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setDidCopy(true);
        window.clearTimeout(copiedTimeoutRef.current);
        copiedTimeoutRef.current = window.setTimeout(() => {
          setDidCopy(false);
        }, COPIED_LABEL_DURATION_MS);
      })
      .catch(() => undefined);
  }, [shareUrl]);

  const rewardAmount = intl.n(REFERRAL_REWARD_ROBUX);
  const rewardRobux = translate(
    "Label.ReferralRewardRobux",
    { amount: rewardAmount },
    `${rewardAmount} Robux`,
  );
  const title = translate("Heading.ReferralShare", undefined, "Share Plus, get");

  return (
    <main className={`${WRAPPER_MARGIN_CANCEL_CLASS} bg-surface-0 flex flex-col`}>
      {/* 48px top offset matches PurchaseView, so switching views does not shift the content. */}
      <div
        className={`${CONTENT_COLUMN_CLASS} gap-y-large medium:gap-y-xxlarge margin-top-[48px] padding-bottom-large flex flex-col`}
      >
        {/* Foundation ships one pictogram per theme rather than a themeable component. */}
        <img
          alt=""
          className={`${PICTOGRAM_CLASS} ${PICTOGRAM_GAP_CLASS} dark:hidden`}
          src={sharePlusLight}
        />
        <img
          alt=""
          className={`${PICTOGRAM_CLASS} ${PICTOGRAM_GAP_CLASS} hidden dark:block`}
          src={sharePlusDark}
        />

        <div className="gap-y-none flex flex-col">
          {/*
           * Builder Extended inline rather than `font-builder-extended`: the responsive
           * `text-*` variants set the `font` shorthand, which resets font-family, and their media
           * queries compile last so they would outrank the class at every breakpoint above small.
           */}
          <h1
            className="text-heading-medium medium:text-heading-large large:text-display-small content-emphasis margin-none gap-x-small wrap flex items-center"
            style={{ fontFamily: '"Builder Extended", "Builder Sans", sans-serif' }}
          >
            {title}
            <span className="gap-x-xsmall flex items-center">
              <Icon name="icon-regular-robux" size="XLarge" />
              {rewardAmount}
            </span>
          </h1>
          <p className="text-body-medium medium:text-body-large content-default margin-none">
            {translate(
              "Description.ReferralShare",
              { amount: rewardAmount },
              `Invite someone to Plus and you both get ${rewardAmount} Robux when they join.`,
            )}
          </p>
        </div>

        <div className="gap-y-medium flex flex-col">
          <RewardRow
            amount={rewardRobux}
            description={translate(
              "Description.ReferralReferrerReward",
              undefined,
              "When anyone joins Plus with your link.",
            )}
            label={translate("Label.ReferralYouGet", undefined, "You get")}
          />
          <RewardRow
            amount={rewardRobux}
            description={translate(
              "Description.ReferralRecipientReward",
              undefined,
              "Offer valid for new Plus subscribers only.",
            )}
            label={translate("Label.ReferralTheyGet", undefined, "Your referrals get")}
          />
        </div>

        <StatsCards
          pendingRobux={robloxPlusUserBenefits?.pendingRobuxEarnedFromReferrals}
          referralCount={robloxPlusUserBenefits?.referralsCount}
          robuxEarned={robloxPlusUserBenefits?.robuxEarnedFromReferrals}
        />
      </div>

      <div className="padding-y-medium shrink-0">
        <div className={`${CONTENT_COLUMN_CLASS} gap-y-small flex flex-col`}>
          {/* Tops align rather than centers, so the copy button stays level with the field when an
              error message extends it. */}
          <div className="gap-x-small flex items-start">
            {/* TextInput is `width-full`, so it fills this box; the box is what shrinks with the
                URL instead of pushing the button off the row. */}
            <div className="grow-1 min-width-0">
              <TextInput
                aria-label={translate("Description.ReferralShareLink", undefined, "Referral link")}
                error={
                  shareUrlError
                    ? translate(
                        "Message.ReferralLinkError",
                        undefined,
                        "We could not create your link. Please try again later.",
                      )
                    : undefined
                }
                hasError={Boolean(shareUrlError)}
                isDisabled
                readOnly
                size="Large"
                value={
                  shareUrlError
                    ? ""
                    : (shareUrl ?? translate("Label.Loading", undefined, "Loading"))
                }
              />
            </div>
            <Button
              className={COPY_BUTTON_WIDTH_CLASS}
              isDisabled={!shareUrl}
              isLoading={isShareUrlLoading}
              size="Large"
              variant="Emphasis"
              onClick={handleCopy}
            >
              {didCopy
                ? translate("Label.ReferralLinkCopied", undefined, "Link copied")
                : translate("Action.CopyReferralLink", undefined, "Copy link")}
            </Button>
          </div>
          <span className="text-caption-medium content-muted">
            {translateHtml(translate, "Description.ReferralTerms", REFERRAL_TERMS_LINK)}
          </span>
        </div>
      </div>
    </main>
  );
};

/**
 * The `/plus?referrals` dashboard.
 *
 * Minting the referral link is also the eligibility check: the endpoint refuses anyone who cannot
 * refer, so a successful call both opens the dashboard and supplies the url it displays. A refusal
 * falls through to the dead-link sheet instead.
 */
const PlusReferralDashboard: FC<PlusReferralDashboardProps> = ({
  onClose,
  robloxPlusUserBenefits,
  subscribeButtonProps,
}) => {
  const [status, setStatus] = useState<GateStatus>("loading");
  const [shareUrl, setShareUrl] = useState<string | undefined>();
  // Held in a ref so a parent passing a fresh callback each render cannot ask for a second link.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    // Signed-out visitors have nothing to refer from and create-link would 401. Close out rather
    // than showing the dead-link sheet, which is for signed-in but ineligible users.
    if (!isAuthenticated()) {
      onCloseRef.current();
      return undefined;
    }

    let isCurrent = true;

    subscriptionsV2Api
      .subscriptionsV2CreateSubscriptionReferralLink()
      .then(data => {
        if (isCurrent) {
          setShareUrl(data.deepLinkUrl);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (isCurrent) {
          setStatus("invalid");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  if (status === "loading") {
    return null;
  }

  return (
    <TranslationProvider config={[...REFERRAL_TRANSLATION_CONFIG]}>
      {status === "ready" ? (
        <DashboardBody robloxPlusUserBenefits={robloxPlusUserBenefits} shareUrl={shareUrl} />
      ) : (
        // No invite to redeem, so this settles on the dead-link face.
        <PlusReferralSheet
          open
          subscribeButtonProps={subscribeButtonProps}
          onOpenChange={open => {
            if (!open) {
              onClose();
            }
          }}
        />
      )}
    </TranslationProvider>
  );
};

export default PlusReferralDashboard;
