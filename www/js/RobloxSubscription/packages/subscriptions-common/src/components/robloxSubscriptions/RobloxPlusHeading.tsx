import { useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";

import type { FC } from "react";

export type RobloxPlusHeadingProps = {
  size?: "large" | "small";
  /**
   * `default` — icon + product name as page title (h1/h2).
   * `compact` — icon + product name as an inline label row (e.g. above a separate promo headline in the parent).
   */
  variant?: "compact" | "default";
};

const RobloxPlusHeading: FC<RobloxPlusHeadingProps> = ({ size = "large", variant = "default" }) => {
  const { translate } = useTranslation();
  const productLabel = translate("Label.Blackbird");

  if (variant === "compact") {
    return (
      <div className="gap-x-xxsmall flex items-center">
        <Icon
          className="relative"
          name="icon-regular-roblox-plus"
          size="Large"
          style={{ top: -1 }}
        />
        <span className="text-label-large content-emphasis text-no-wrap">{productLabel}</span>
      </div>
    );
  }

  return (
    <div className="gap-x-small flex items-center">
      <Icon className="!size-1000 relative" name="icon-regular-roblox-plus" style={{ top: -4 }} />
      {size === "large" ? (
        <h1 className="font-builder-extended text-display-small text-no-wrap">{productLabel}</h1>
      ) : (
        <h2 className="text-heading-large">{productLabel}</h2>
      )}
    </div>
  );
};

export default RobloxPlusHeading;
