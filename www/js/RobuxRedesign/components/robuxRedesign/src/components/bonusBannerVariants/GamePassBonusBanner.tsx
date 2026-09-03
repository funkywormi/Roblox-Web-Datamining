import { useCallback, useContext } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { IconButton, Popover } from "@rbx/core-ui/legacy/react-style-guide";
import { GamePassMetadata } from "../../types/buyRobuxPageData";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { isInApp, isOnDesktop } from "../../utils/platform";

type BannerProps = {
  metadata: GamePassMetadata;
};

export function GamePassBonusBanner({ metadata }: BannerProps) {
  const { translate } = useTranslation();
  const { bonusItemBannerImageUrl, bonusItemImageUrl } = useContext(BuyRobuxPageContext);

  const iconReportHandler = useCallback(() => {
    if (isInApp || isOnDesktop) {
      window.location.href = "/support";
    } else {
      window.open("/support", "_blank");
    }
  }, []);

  return (
    <div className="self-stretch flex flex-row justify-start items-center gap-large personalized-bonus-items__banner-container buy-robux-page">
      <div className="personalized-bonus-items__banner-background" />
      {bonusItemBannerImageUrl && (
        <div
          className="personalized-bonus-items__banner"
          style={{ backgroundImage: `url("${bonusItemBannerImageUrl}")` }}
          title="bonus item banner image"
        />
      )}
      <div className="personalized-bonus-items__banner-gradient" />

      <div className="width-2000 height-2000 margin-left-small" style={{ zIndex: 1 }}>
        {bonusItemImageUrl && (
          <img src={bonusItemImageUrl} alt="bonus item" className="width-full height-full" />
        )}
      </div>
      <div className="personalized-bonus-items__item-description-container">
        <div className="flex flex-col gap-xsmall self-stretch items-start justify-center">
          <div className="flex flex-row text-title-large content-[var(--dark-mode-content-emphasis)] text-wrap">
            {metadata.experienceDisplayName}
            <Popover
              id="personalized-bonus-items__report-popover"
              placement="bottom"
              trigger="hover"
              button={
                <IconButton
                  className="robux-head-icon-button"
                  iconName="moreinfo-i"
                  size={IconButton.sizes.small}
                  onClick={iconReportHandler}
                />
              }
            >
              <p className="personalized-bonus-items__report-popover">
                {translate("Action.ReportItem")}
              </p>
            </Popover>
          </div>
          <div className="text-body-large content-[var(--dark-mode-content-default)] text-wrap">
            {metadata.gamePassDisplayName}
          </div>
        </div>
      </div>
    </div>
  );
}
