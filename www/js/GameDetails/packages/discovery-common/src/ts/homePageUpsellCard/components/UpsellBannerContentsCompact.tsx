import React from "react";
import classnames from "classnames";
import { Button, Icon, TIconProps } from "@rbx/foundation-ui";
import { DEFAULT_UPSELL_BUTTON_SIZE } from "../constants/upsellCardConstants";
import { TButtonProps, TUpsellBannerTextClass } from "../types/upsellCardTypes";

interface TUpsellBannerContentsCompactProps {
  iconClassName?: TIconProps["name"];
  buttonProps?: TButtonProps;
  titleText: string;
  titleTextClassName: TUpsellBannerTextClass;
}

const UpsellBannerContentsCompact: React.FC<TUpsellBannerContentsCompactProps> = ({
  buttonProps,
  titleText,
  iconClassName,
  titleTextClassName,
}) => {
  return (
    <div className="flex flex-row grow-1 gap-medium items-center">
      {iconClassName && (
        <div className="flex shrink-0">
          <Icon size="Large" name={iconClassName} />
        </div>
      )}
      <div className={classnames(titleTextClassName, "grow-1")}>{titleText}</div>
      {buttonProps && (
        <Button
          onClick={buttonProps.onClick}
          variant={buttonProps.variant}
          size={buttonProps.size ?? DEFAULT_UPSELL_BUTTON_SIZE}
          className="shrink-0"
        >
          {buttonProps.text}
        </Button>
      )}
    </div>
  );
};

export default UpsellBannerContentsCompact;
