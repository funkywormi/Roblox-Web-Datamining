import React from "react";
import { Badge, Button, Icon, IconButton } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { DEFAULT_UPSELL_BUTTON_SIZE } from "../constants/upsellCardConstants";
import { TBadgeProps, TButtonProps, TUpsellBannerTextClass } from "../types/upsellCardTypes";

interface TUpsellBannerContentsFullProps {
  badgePropsArray: TBadgeProps[];
  titleText: string;
  bodyText?: string;
  iconClassName?: TBadgeProps["iconClassName"];
  dismissible: boolean;
  onDismiss: () => void;
  buttonPropsArray: TButtonProps[];
  titleTextClassName: TUpsellBannerTextClass;
  bodyTextClassName: TUpsellBannerTextClass;
}

const UpsellBannerContentsFull: React.FC<TUpsellBannerContentsFullProps> = ({
  badgePropsArray,
  titleText,
  bodyText,
  iconClassName,
  dismissible,
  onDismiss,
  buttonPropsArray,
  titleTextClassName,
  bodyTextClassName,
}) => {
  const shouldShowBadges = badgePropsArray.length > 0;
  const { translate } = useTranslation();

  return (
    <div className="flex flex-col grow-1 gap-large">
      {shouldShowBadges && (
        <div className="flex flex-row width-full gap-large align-y-center">
          <div className="flex flex-row grow-1 gap-large">
            {badgePropsArray.map(badgeProps => (
              <Badge
                variant="Neutral"
                label={badgeProps.text}
                icon={badgeProps.iconClassName}
                key={badgeProps.text}
              />
            ))}
          </div>
          {dismissible && (
            <IconButton
              variant="Utility"
              size="Medium"
              icon="icon-filled-x"
              onClick={onDismiss}
              className="size-600 shrink-0"
              ariaLabel={translate("Action.Close")}
            />
          )}
        </div>
      )}

      <div className="flex flex-row gap-medium">
        {iconClassName && (
          <div className="height-full shrink-0">
            <Icon size="Large" name={iconClassName} />
          </div>
        )}
        <div className={`flex flex-col grow-1 ${bodyText ? "gap-xsmall" : "gap-small"}`}>
          <div className={titleTextClassName}>{titleText}</div>
          <div className="flex flex-col gap-large">
            {bodyText && <div className={bodyTextClassName}>{bodyText}</div>}
            <div className="flex flex-row flex-wrap gap-small">
              {buttonPropsArray.map(buttonProps => (
                <Button
                  onClick={buttonProps.onClick}
                  variant={buttonProps.variant}
                  size={buttonProps.size ?? DEFAULT_UPSELL_BUTTON_SIZE}
                  aria-label={buttonProps.text}
                  key={buttonProps.text}
                  className="shrink-0"
                >
                  {buttonProps.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {dismissible && !shouldShowBadges && (
          <IconButton
            variant="Utility"
            size="Medium"
            icon="icon-filled-x"
            onClick={onDismiss}
            className="size-600 shrink-0"
            ariaLabel={translate("Action.Close")}
          />
        )}
      </div>
    </div>
  );
};

export default UpsellBannerContentsFull;
