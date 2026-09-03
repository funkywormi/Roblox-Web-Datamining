import { useEffect, useMemo } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { UIThemeProvider, Typography } from "@rbx/ui";
import {
  config,
  getCurrencyConfig,
  translationKeys,
  Country,
} from "../constants/shopGiftcardsConstants";

import PromoItemCard from "./PromoItemCard";
import BuyGiftCardForm from "./BuyGiftCardForm";
import NavHeader from "./NavHeader";
import NavFooter from "./NavFooter";
import faceplateImage from "../images/roblox-gift-card-442.png";
import useGiftCardAnalytics from "../hooks/useGiftCardAnalytics";

const ShopGiftcardsPageContainer: React.FC<WithTranslationsProps> = ({
  translate,
  intl,
}): JSX.Element => {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const location = (searchParams.get("location") || config.defaultCountry).toLowerCase() as Country;
  const currencyConfig = getCurrencyConfig(location);
  const giftCardAnalytics = useGiftCardAnalytics();

  useEffect(() => {
    giftCardAnalytics.trackLanding(
      searchParams.get("location") || config.defaultCountry,
      searchParams.get("ref") || "",
      currencyConfig.cardBalanceOptions.default,
    );
  }, []);

  return (
    <UIThemeProvider theme="dark" cssBaselineMode="disabled">
      <NavHeader translate={translate} intl={intl} />

      <div className="container dark-theme">
        <div className="main-content">
          <div className="hero-title">
            <div className="hero-title-wrapper">
              <Typography className="text-maintitle" variant="h1">
                {translate(
                  currencyConfig.useModifiedTitle
                    ? translationKeys.hero.modifiedTitle
                    : translationKeys.hero.title,
                )}
              </Typography>
            </div>
          </div>

          <div className="main-flex-container">
            <div className="hero-section">
              <div className="hero-image">
                <img src={faceplateImage} alt="Roblox Gift Card" />
              </div>

              <PromoItemCard translate={translate} intl={intl} />
            </div>

            <BuyGiftCardForm
              translate={translate}
              intl={intl}
              country={location}
              currencyConfig={currencyConfig}
              searchParams={searchParams}
              giftCardAnalytics={giftCardAnalytics}
            />
          </div>
        </div>
      </div>

      <NavFooter translate={translate} intl={intl} />
    </UIThemeProvider>
  );
};

export default ShopGiftcardsPageContainer;
