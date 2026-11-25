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
  /** Identifies the calling surface to the account settings, e.g. `Search_Omnisearch_Experiences`. */
  surfaceKey: string;
  className?: string;
  /**
   * Leave focus where it is when the menu opens, instead of moving it to the first item. For hosts
   * that close when they lose focus, such as the search landing page, which hides when the search
   * input blurs.
   */
  keepFocusOnOpen?: boolean;
};

/**
 * Three-dot menu with one item that opens the Personalized recommendations settings (EU DSA
 * Article 38). The caller decides whether it shows: it checks the server's signal for the surface
 * (for example a response flag or a surface key) and the app policy.
 */
export const PersonalizedRecommendationsMenu = ({
  surfaceKey,
  className,
  keepFocusOnOpen = false,
}: PersonalizedRecommendationsMenuProps) => {
  const [open, setOpen] = useState(false);
  const translate = useTranslations("Feature.AccountSettings");
  const label = translate(
    "Heading.Tab.PersonalizedRecommendations",
    undefined,
    "Personalized recommendations",
  );

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
      <PopoverContent
        side="bottom"
        align="end"
        ariaLabel={label}
        onOpenAutoFocus={
          keepFocusOnOpen
            ? e => {
                e.preventDefault();
              }
            : undefined
        }
      >
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
};
