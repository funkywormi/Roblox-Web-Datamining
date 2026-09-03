import React from "react";
import { Link } from "react-style-guide";
import { WithTranslationsProps } from "react-utilities";
import {
  redeemGiftCardURL,
  redeemBonusItemURL,
  redeemPromoCodeURL,
  robloxSafetyURL,
  RedeemInstructionsYoutubeVideoIdByLocale,
} from "../constants/redeemGiftCardConstants";

const getVideoUrlByLocale = (locale: string) => {
  const videoId =
    RedeemInstructionsYoutubeVideoIdByLocale[locale] ||
    RedeemInstructionsYoutubeVideoIdByLocale.default;
  return `https://www.youtube-nocookie.com/embed/${videoId}?controls=0&modestbranding=1&iv_load_policy=3&fs=0&rel=0`;
};

type RedeemInstructionsProps = WithTranslationsProps;

function RedeemInstructions({ translate }: RedeemInstructionsProps): React.ReactElement {
  const instructionsTitle = translate("Heading.AdditionalInfo");
  const userLocale = document.documentElement.lang;

  return (
    <div className="gift-card-instructions-container">
      <div className="container-header">
        <h2 className="instructions-title">{instructionsTitle}</h2>
      </div>
      <Link
        url={getVideoUrlByLocale(userLocale)}
        className="font-header-2 text-link"
        target="_blank"
      >
        {translate("Label.HowToRedeemGiftCardVideoText") || "How to Redeem Gift Cards (Video)"}
      </Link>
      <Link url={redeemGiftCardURL} className="font-header-2 text-link">
        {translate("Label.MoreHelpOnGiftCardsLinkText") || "More Help on Gift Cards"}
      </Link>
      <Link url={redeemBonusItemURL} className="font-header-2 text-link">
        {translate("Label.HowToRedeemVirtualItemCodes") || "How to Redeem Virtual Item Codes"}
      </Link>
      <Link url={redeemPromoCodeURL} className="font-header-2 text-link">
        {translate("Label.HowToRedeemPromoCodes") || "How to Redeem Promo Codes"}
      </Link>
      <Link url={robloxSafetyURL} className="font-header-2 text-link">
        {translate("Label.LearnAboutRobloxSafety") ||
          "Learn About Roblox Safety, Moderation, and Parental Controls"}
      </Link>
    </div>
  );
}

export default RedeemInstructions;
