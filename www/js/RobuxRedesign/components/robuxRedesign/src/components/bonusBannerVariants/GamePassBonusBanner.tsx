import { useCallback, useContext } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { IconButton, Tooltip, TooltipTrigger } from "@rbx/foundation-ui";
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
    // Note: this component is always rendered in the dark theme with --color-extended-gray-1200 as the main background color
    <div
      className="color-mode-dark dark-theme self-stretch flex flex-row justify-start items-center gap-large clip relative buy-robux-page min-height-[112px]"
      style={{
        borderTopLeftRadius: "var(--radius-large)",
        borderTopRightRadius: "var(--radius-large)",
      }}
    >
      <div
        className="absolute height-full width-full"
        style={{ flexGrow: 0, flexShrink: 0, backgroundColor: "var(--color-extended-gray-1200)" }}
      />
      {bonusItemBannerImageUrl && (
        <div
          className="absolute height-full width-full"
          style={{
            backgroundImage: `url("${bonusItemBannerImageUrl}")`,
            backgroundPositionY: "44%",
            backgroundPositionX: "center",
            backgroundSize: "852px",
            opacity: 0.4,
          }}
          title="bonus item banner image"
        />
      )}
      <div
        className="absolute height-full width-full"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(18, 18, 21, 1), rgb(18, 18, 21, 0))",
        }}
      />

      <div className="width-2000 height-2000 margin-left-small" style={{ zIndex: 1 }}>
        {bonusItemImageUrl && (
          <img src={bonusItemImageUrl} alt="bonus item" className="width-full height-full" />
        )}
      </div>
      <div
        style={{
          margin: "auto auto auto 0",
          padding: "21px 16px 21px 0",
          zIndex: 1,
        }}
      >
        <div className="flex flex-col gap-xsmall self-stretch items-start justify-center">
          <div className="flex flex-row items-center text-title-large content-[var(--dark-mode-content-emphasis)] text-wrap">
            <div>{metadata.experienceDisplayName}</div>
            <Tooltip position="bottom-center" title={translate("Action.ReportItem")}>
              <TooltipTrigger asChild>
                <IconButton
                  variant="Utility"
                  size="XSmall"
                  icon="icon-regular-circle-i"
                  ariaLabel="More information"
                  onClick={iconReportHandler}
                />
              </TooltipTrigger>
            </Tooltip>
          </div>
          <div className="text-body-large content-[var(--dark-mode-content-default)] text-wrap">
            {metadata.gamePassDisplayName}
          </div>
        </div>
      </div>
    </div>
  );
}
