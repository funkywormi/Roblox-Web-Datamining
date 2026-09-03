import React, { useCallback, useMemo } from "react";
import classnames from "classnames";
import { TIconProps } from "@rbx/foundation-ui";
import UpsellBannerContentsCompact from "./UpsellBannerContentsCompact";
import {
  DEFAULT_UPSELL_BODY_TEXT_CLASS,
  DEFAULT_UPSELL_TITLE_TEXT_CLASS,
} from "../constants/upsellCardConstants";
import {
  TAnalyticsProps,
  TBadgeProps,
  TButtonProps,
  TUpsellBannerTextClass,
} from "../types/upsellCardTypes";
import UpsellBannerContentsFull from "./UpsellBannerContentsFull";
import isCompactUpsellBannerConfig from "../utils/isCompactUpsellBannerConfig";
import useUpsellAnalytics from "../hooks/useUpsellAnalytics";

interface TUpsellBannerProps {
  badgePropsArray: TBadgeProps[];
  titleText: string;
  bodyText?: string;
  iconClassName?: TIconProps["name"];
  dismissible: boolean;
  onDismiss: () => void;
  buttonPropsArray: TButtonProps[];
  analyticsConfig?: TAnalyticsProps;
  titleTextClassName?: TUpsellBannerTextClass;
  bodyTextClassName?: TUpsellBannerTextClass;
  hideBackground?: boolean;
}

const UpsellBanner: React.FC<TUpsellBannerProps> = ({
  badgePropsArray,
  titleText,
  bodyText,
  iconClassName,
  dismissible,
  buttonPropsArray,
  onDismiss,
  analyticsConfig,
  titleTextClassName = DEFAULT_UPSELL_TITLE_TEXT_CLASS,
  bodyTextClassName = DEFAULT_UPSELL_BODY_TEXT_CLASS,
  hideBackground = false,
}) => {
  // Use custom hook to manage all analytics logic
  const { logDismissed, logButtonClick } = useUpsellAnalytics(analyticsConfig);

  const handleDismiss = useCallback(() => {
    logDismissed();
    onDismiss();
  }, [logDismissed, onDismiss]);

  const createButtonClickHandler = useCallback(
    (originalOnClick: () => void, buttonVariant: string) => {
      return () => {
        logButtonClick(buttonVariant);
        originalOnClick();
      };
    },
    [logButtonClick],
  );

  const buttonPropsArrayWithTelemetry = useMemo(
    () =>
      buttonPropsArray.map((buttonProps: TButtonProps) => ({
        ...buttonProps,
        onClick: createButtonClickHandler(buttonProps.onClick, buttonProps.variant),
      })),
    [buttonPropsArray, createButtonClickHandler],
  );

  const shouldShowCompactBanner = isCompactUpsellBannerConfig({
    badgePropsArray,
    buttonPropsArray,
    dismissible,
    bodyText,
  });

  return (
    <div className="flex margin-bottom-medium">
      <div
        className={classnames(
          "flex grow-1 radius-medium padding-large stroke-standard stroke-default",
          { "bg-shift-100": !hideBackground },
        )}
      >
        {shouldShowCompactBanner ? (
          <UpsellBannerContentsCompact
            buttonProps={buttonPropsArrayWithTelemetry[0]}
            titleText={titleText}
            iconClassName={iconClassName}
            titleTextClassName={titleTextClassName}
          />
        ) : (
          <UpsellBannerContentsFull
            badgePropsArray={badgePropsArray}
            titleText={titleText}
            bodyText={bodyText}
            iconClassName={iconClassName}
            dismissible={dismissible}
            onDismiss={handleDismiss}
            buttonPropsArray={buttonPropsArrayWithTelemetry}
            titleTextClassName={titleTextClassName}
            bodyTextClassName={bodyTextClassName}
          />
        )}
      </div>
    </div>
  );
};

export default UpsellBanner;
