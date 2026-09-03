import React, { useState } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { Banner } from "react-style-guide";
import { DeviceMeta } from "Roblox";
import redeemBanner from "../images/roblox-gift-card.png";
import RedeemGiftCardForm from "./redeemGiftCardForm";
import RedeemInstructions from "./redeemInstructions";
import RedeemedItemBanner from "./RedeemedItemBanner";
import { eventTypes } from "../constants/redeemGiftCardConstants";
import sendRedeemGiftCardEvent from "../utils/events";
import LocalCreditBannerStage from "../enums/LocalCreditBannerStage";
import GeneralBanner from "./generalBanner";
import useAccountCountry from "../hooks/useAccountCountry";

type Props = {
  translate: TranslateFunction;
  intl: { getRobloxLocale: () => string };
  pinPlaceholder: string;
  showTwentyPercentMoreRobux: boolean;
};

type LocalCreditsBannerInfo = {
  bannerTitle: string | null;
  bannerContent: string | null;
  icon: string | null;
};

type RedeemedItemBannerData = {
  itemName: string;
  itemId: number;
  itemType?: string;
};

const getLocalCreditsBannerInfo = (
  localCreditRolloutStage: string | undefined,
  translate: TranslateFunction,
): LocalCreditsBannerInfo => {
  switch (localCreditRolloutStage) {
    case LocalCreditBannerStage.PRELAUNCH_BANNER_POSTED_1:
      return {
        bannerTitle:
          translate("Heading.LocalCreditBanner") ||
          "NOTICE: Upcoming Change to Redemption Rate for Roblox Credit (Local Currency)",
        bannerContent:
          translate("Message.LocalCreditBanner") ||
          "Beginning in April 2023 Roblox credit will no longer be denominated in U.S. Dollars. All Roblox gift cards will be redeemable for credit denominated in your local currency. We will send messages to your Roblox Inbox starting in January with more information.",
        icon: null,
      };
    case LocalCreditBannerStage.PRELAUNCH_BANNER_POSTED_2:
      return {
        // the wording here is still TBD, these would be updated and translated in a later PR
        bannerTitle: "Upcoming outage due to credit balance currency change",
        bannerContent:
          "Starting on Month 00, 2023 the redemption service will be paused to support currency migration in multiple countries.",
        icon: null,
      };
    case LocalCreditBannerStage.SERVICE_PAUSE:
      return {
        // the wording here is still TBD, these would be updated and translated in a later PR
        bannerTitle: "Redemption Outage",
        bannerContent:
          "Code redemptions will be unavailable on Month 00, 2023. Service will resume soon.",
        icon: "warning",
      };
    default:
      return {
        bannerTitle: null,
        bannerContent: null,
        icon: null,
      };
  }
};

function RedeemGiftCard({ translate, intl, pinPlaceholder, showTwentyPercentMoreRobux }: Props) {
  const [redeemedItemBannerData, setRedeemedItemBannerData] =
    useState<RedeemedItemBannerData | null>(null);
  const redeemTitle = translate("Heading.RedeemRobloxCodes");
  sendRedeemGiftCardEvent(eventTypes.pageLoaded);
  const localCreditDataset = document.getElementById("redeem-gift-card-container")?.dataset;
  const localCreditBannerStage =
    localCreditDataset?.localCreditBannerStage ?? LocalCreditBannerStage.NOT_STARTED;
  const isEligibleForLocalCredits =
    localCreditDataset?.isEligibleForLocalCreditBanner?.toLowerCase() === "true";
  const { bannerTitle, bannerContent, icon } = getLocalCreditsBannerInfo(
    localCreditBannerStage,
    translate,
  );
  const { countryName } = useAccountCountry();

  const upsellBannerTitle =
    translate("Heading.ConvertRobloxCreditGet20PercentMoreRobux") ||
    translate("Heading.ConvertRobloxCreditGetUpTo20PercentMoreRobux");
  const upsellBannerContent = translate("Label.OfferAvailableOnDesktopWeb");

  /// Redeem Gift Card component is only available on:
  /// - iOS UA US
  /// - All web (on all platforms wherever you go to roblox.com/redeem) including mobile web
  /// - Samsung devices
  /// - Desktop UA (Mac + Windows)

  const isNonWebView =
    !DeviceMeta().isUniversalApp &&
    !DeviceMeta().isConsole &&
    (DeviceMeta().isDesktop || !DeviceMeta().isInApp);

  const isMacUAOrWinUANonUWP = DeviceMeta().isDesktop && DeviceMeta().isUniversalApp;

  const isUSIos = DeviceMeta().isIosApp && countryName === "United States";

  if (
    !DeviceMeta().isUWPApp &&
    (isNonWebView || isMacUAOrWinUANonUWP || DeviceMeta().isSamsungGalaxyStoreApp || isUSIos)
  ) {
    return (
      <div id="redeem-gift-card">
        {showTwentyPercentMoreRobux ? (
          <GeneralBanner
            bannerTitle={upsellBannerTitle}
            bannerContent={upsellBannerContent}
            bannerContainerClassName="twenty-percent-more-upsell-banner"
            bannerTitleClassName="twenty-percent-more-upsell-banner-title"
            bannerContentClassName="twenty-percent-more-upsell-banner-content"
          />
        ) : null}
        {isEligibleForLocalCredits &&
          localCreditBannerStage &&
          localCreditBannerStage !== LocalCreditBannerStage.NOT_STARTED &&
          localCreditBannerStage !== LocalCreditBannerStage.ROLLOUT_STARTED && (
            // TODO: fix the type/logic below to not require !
            <Banner
              bannerTitle={bannerTitle!}
              bannerContent={bannerContent!}
              icon={icon!}
              className="common-banner"
            />
          )}
        <div className="container-header">
          <h1>{redeemTitle}</h1>
        </div>
        {redeemedItemBannerData ? (
          <RedeemedItemBanner
            itemName={redeemedItemBannerData.itemName}
            itemId={redeemedItemBannerData.itemId}
            itemType={redeemedItemBannerData.itemType}
            translate={translate}
            onDismiss={() => setRedeemedItemBannerData(null)}
          />
        ) : null}
        <div className="col-sm-12 col-md-6 left-column">
          <RedeemGiftCardForm
            translate={translate}
            intl={intl}
            pinPlaceholder={pinPlaceholder}
            showTwentyPercentMoreRobux={showTwentyPercentMoreRobux}
            onShowRedeemedItemBanner={setRedeemedItemBannerData}
          />
        </div>
        <div className="col-sm-12 col-md-6 right-column">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <RedeemInstructions translate={translate} intl={intl as any} />
          <a className="redeem-banner" href="/giftcards">
            <img src={redeemBanner} alt="redeem-banner" />
          </a>
        </div>
      </div>
    );
  }

  // Return redeem gift card page not available for all other platforms
  const enterCodeInstruction =
    translate("Action.RedeemGiftCardOrItemOrPromoCodeDisabled") ||
    "Roblox Gift Cards are not redeemable on the mobile app and must be redeemed on the web";

  return (
    <div id="redeem-gift-card">
      <div className="container-header">
        <h1>{redeemTitle}</h1>
      </div>
      <div className="redeem-gift-card-form">
        <div className="redeem-gift-card-form-container">
          <div className="container-header">
            <h2 className="enter-code-instruction">{enterCodeInstruction}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RedeemGiftCard;
