import { useState } from "react";
import classNames from "classnames";
import {
  Icon,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@rbx/foundation-ui";
import { openAccountSettings } from "@rbx/account-settings-entry-points";
import { useTranslations } from "@rbx/www-common/i18n";

type PersonalizedRecommendationsMenuProps = {
  // Surface key from the VLOP Web Settings Integration guide, e.g. "Web_BuyRobux_Packages"
  surfaceKey: string;
  // Layout classes for the trigger, so the caller can place it without a wrapper element
  className?: string;
};

/**
 * Section-heading three-dot menu that opens the Personalized recommendations settings (EU DSA
 * Article 38). Callers render it only when the section's showPersonalizedRecommendationsMenu is
 * true.
 */
export function PersonalizedRecommendationsMenu({
  surfaceKey,
  className,
}: PersonalizedRecommendationsMenuProps) {
  const [open, setOpen] = useState(false);
  const translate = useTranslations("Feature.BuyRobux");

  const label = translate("Action.ContentPersonalization", undefined, "Content personalization");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton
          className={classNames("bg-none shrink-0", className)}
          icon="icon-regular-three-dots-horizontal"
          ariaLabel={label}
          variant="Utility"
          size="Small"
        />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" ariaLabel={label}>
        <Menu size="Medium">
          <MenuItem
            value="personalized-recommendations"
            title={label}
            leading={<Icon name="icon-regular-gear" />}
            onSelect={() => {
              setOpen(false);
              openAccountSettings({ surfaceKey });
            }}
          />
        </Menu>
      </PopoverContent>
    </Popover>
  );
}
