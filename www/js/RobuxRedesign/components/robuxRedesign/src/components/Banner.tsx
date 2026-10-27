import classNames from "classnames";
import { useContext, Fragment } from "react";
import { Icon } from "@rbx/foundation-ui";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { useFullKeyTranslations } from "@rbx/www-common/i18n";
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
    buyRobuxPageData: { pageHeaderMetadata },
    urlParams,
  } = useContext(BuyRobuxPageContext);
  const { translateFullKey } = useFullKeyTranslations();

  const showWebviewHeader = urlParams.showHeader === "true";

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
  const strikethrough = { used: false };
  const comparisonHeading =
    percentage && strikethroughPercentage
      ? translateFullKey.html(
          translationKey,
          [
            {
              opening: "divTagStart",
              closing: "divTagEnd",
              render: children => {
                strikethrough.used = true;
                return (
                  <span className="line-through [font-weight:normal] [color:var(--color-extended-gray-600)]">
                    {children}
                  </span>
                );
              },
            },
          ],
          { strikethroughPercentage, percentage },
        )
      : undefined;

  // The HTML adapter returns null for missing keys or malformed pairs; keep the plain heading.
  const hasComparisonHeading = comparisonHeading != null;
  // Plain copy can also be returned by html; only widen a successfully rendered strikethrough.
  const hasStrikethroughHeading = hasComparisonHeading && strikethrough.used;

  const heading = (
    <h1
      className={classNames(
        "self-stretch text-align-x-left text-section-title content-emphasis large:text-align-x-center padding-y-none",
        // Side inset only at `large` (1141px) and only for the shorter heading.
        // A media query keeps the class stable across server and client.
        !hasStrikethroughHeading && "large:margin-x-[120px]",
      )}
    >
      {hasComparisonHeading
        ? comparisonHeading
        : translateFullKey(translationKey, percentage ? { percentage } : {})}
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
