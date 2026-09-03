import { useContext, Fragment } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { translateHtml } from "@rbx/translation-utils";
import { BuyRobuxPageContext } from "../contexts/BuyRobuxPageContext";
import { isInApp } from "../utils/platform";
import type { SectionTransfers } from "../types/buyRobuxPageData";

const RobuxBalance = () => {
  const { robuxBalance } = useContext(BuyRobuxPageContext);
  if (typeof robuxBalance !== "number") {
    return null;
  }

  return (
    <Fragment>
      <Icon name="icon-filled-robux" />
      <span className="text-label-medium content-action-standard">
        {formatNumber(robuxBalance)}
      </span>
    </Fragment>
  );
};

export function Banner({ transfers }: { transfers?: SectionTransfers }) {
  const {
    breakpoint,
    buyRobuxPageData: { pageHeaderMetadata },
    urlSearchParams,
  } = useContext(BuyRobuxPageContext);
  const { translate } = useTranslation();

  const isAboveLarge = breakpoint.isAboveInclusive("large");
  const showWebviewHeader = urlSearchParams.get("showHeader") === "true";

  const stickyRobuxBalance =
    showWebviewHeader && !transfers ? (
      <div
        className="self-stretch flex flex-row space-between items-center"
        style={{
          position: "sticky",
          top: "calc(10px + env(safe-area-inset-top))",
          zIndex: 1,
          marginTop: "-4px",
        }}
      >
        <div className="flex flex-row justify-center items-center gap-small height-1000 padding-left-medium padding-right-large radius-circle bg-surface-0 margin-left-auto">
          <RobuxBalance />
        </div>
      </div>
    ) : null;

  // Server-driven header: BE populates pageHeaderMetadata for surfaces that should show the header
  // (e.g., web, Samsung) and omits it for suppressed surfaces (e.g., mobile in-app).
  // When absent, we simply don't render the heading or subscriber subtitle.
  if (!pageHeaderMetadata) {
    return stickyRobuxBalance;
  }

  const {
    promotionalRobuxPercentage: percentage,
    strikethroughPromotionalRobuxPercentage: strikethroughPercentage,
    translationKey,
  } = pageHeaderMetadata;

  // Both percentages present means the header compares the old rate against the promotional one,
  // with the old rate struck through inside {divTagStart}/{divTagEnd}.
  const comparisonHeading =
    percentage && strikethroughPercentage
      ? translateHtml(
          translate,
          translationKey,
          [
            {
              opening: "divTagStart",
              closing: "divTagEnd",
              render: children => (
                <span className="line-through [font-weight:normal] [color:var(--color-extended-gray-600)]">
                  {children}
                </span>
              ),
            },
          ],
          { strikethroughPercentage, percentage },
        )
      : undefined;

  // translateHtml yields an empty array if the resolved string is missing those placeholders, so
  // fall back to the plain heading rather than leaving the page header blank.
  const hasComparisonHeading = comparisonHeading !== undefined && comparisonHeading.length > 0;

  const heading = (
    <h1
      className="self-stretch text-align-x-left text-section-title content-emphasis large:text-align-x-center padding-y-none"
      style={
        isAboveLarge && !hasComparisonHeading
          ? { marginLeft: "120px", marginRight: "120px" }
          : undefined
      }
    >
      {hasComparisonHeading
        ? comparisonHeading
        : translate(translationKey, percentage ? { percentage } : {})}
    </h1>
  );

  return showWebviewHeader ? (
    <Fragment>
      {stickyRobuxBalance}
      <div className="flex flex-col justify-center items-center self-stretch padding-bottom-medium large:padding-y-xxlarge large:gap-large gap-small">
        {heading}
      </div>
    </Fragment>
  ) : (
    <div className="flex flex-col justify-center items-center self-stretch padding-bottom-medium large:padding-y-xxlarge large:gap-large gap-small padding-top-xlarge">
      {!isInApp && !transfers && (
        <div className="self-stretch flex flex-row justify-end items-center large:hidden">
          <div className="flex flex-row justify-center items-center gap-small height-1000 padding-left-medium padding-right-large radius-circle bg-surface-0">
            <RobuxBalance />
          </div>
        </div>
      )}
      {heading}
    </div>
  );
}
