"use client";
import React, { useCallback, useMemo, useState } from "react";
import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Menu,
  MenuSection,
  MenuItem,
} from "@rbx/foundation-ui";
import {
  isPlainLeftClick,
  SUPPORTED_ICON_CLASSES,
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
} from "@rbx/sdui-core";

export interface SduiOverflowMenuItemData {
  id: string;
  text: string;
  /** SDUI icon path, e.g. `icons/actions/block`. Unmapped paths render no icon. */
  icon?: string;
  onActivated?: SduiResolvedAction;
}

export type SduiOverflowMenuProps = SduiRendererInjectedProps & {
  items?: SduiOverflowMenuItemData[];
  buttonAriaLabel?: string;
  /** Adds `menuItemId` and `availableMenuItemIds` to each item's action params for telemetry. */
  includeMenuItemTelemetry?: boolean;
  /**
   * Local prop from a tile that places the menu over its media: the small
   * filled over-media trigger, whose clicks don't reach the tile.
   */
  isOverMedia?: boolean;
  /** Local prop. Called when the menu opens or closes, with its item ids. */
  onOpenChange?: (isOpen: boolean, menuItemIds: string[]) => void;
};

// Hardcoded until the icon PR lands; a follow-up will wire server-driven icon
// customization (FoundationIconConfigProp) once that infra is on master.
// The literal is scanned by Tailwind content detection so the icon class ships.
const OVERFLOW_ICON = "icon-regular-three-dots-horizontal";
const OVER_MEDIA_OVERFLOW_ICON = "icon-filled-three-dots-horizontal";

/**
 * Foundation overflow menu: IconButton trigger + Popover Menu of actions.
 * Flat `items` list in a single MenuSection (multi-section not supported yet).
 */
export function SduiOverflowMenu({
  items,
  buttonAriaLabel = "More options",
  includeMenuItemTelemetry,
  isOverMedia = false,
  onOpenChange,
}: SduiOverflowMenuProps): React.JSX.Element | null {
  const [open, setOpen] = useState(false);

  // Default `items = []` only covers `undefined`. Until ArrayOfMenuItemProp is
  // fully resolved, a mis-built object (e.g. `{ array: [...] }`) must not crash
  // the parent feed via `.map`.
  const menuItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const menuItemIds = useMemo(() => menuItems.map(item => item.id), [menuItems]);

  const setMenuOpen = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen !== open) {
        onOpenChange?.(nextOpen, menuItemIds);
      }
      setOpen(nextOpen);
    },
    [open, onOpenChange, menuItemIds],
  );

  return (
    <Popover open={open} onOpenChange={setMenuOpen}>
      <PopoverTrigger asChild>
        <IconButton
          icon={isOverMedia ? OVER_MEDIA_OVERFLOW_ICON : OVERFLOW_ICON}
          ariaLabel={buttonAriaLabel}
          variant={isOverMedia ? "OverMedia" : "Utility"}
          size={isOverMedia ? "Small" : undefined}
          isCircular={isOverMedia}
          onClick={(e: React.MouseEvent) => {
            // The menu is often nested inside a clickable tile (SduiGameTile
            // wraps its overlay in an <a href>). Prevent default so the trigger
            // click doesn't bubble to the parent anchor and navigate. Note that
            // preventDefault also suppresses Radix's built-in open-toggle
            // (composed with checkForDefaultPrevented), so drive `open` here.
            e.preventDefault();
            if (isOverMedia) {
              e.stopPropagation();
            }
            setMenuOpen(!open);
          }}
        />
      </PopoverTrigger>
      <PopoverContent ariaLabel={buttonAriaLabel} side="bottom" align="end">
        <Menu
          className={
            isOverMedia
              ? "max-width-[calc(var(--radix-popover-content-available-width)-2rem)]"
              : undefined
          }
        >
          <MenuSection>
            {menuItems.map(item => {
              // Pure-navigation actions (LINK, OPEN_GAME_DETAILS, etc.) have no
              // click-time handler — their resolved `href` does the navigation.
              // Render those as an anchor so the link actually navigates, while
              // still invoking `onActivated` for telemetry. Mirrors SduiButton.
              const href = item.onActivated?.href;
              const clientNavigation = item.onActivated?.clientNavigation ?? false;
              const iconClass = item.icon ? SUPPORTED_ICON_CLASSES[item.icon] : undefined;
              const leading = iconClass ? (
                <span aria-hidden className={`${iconClass} size-[var(--icon-size-medium)]`} />
              ) : undefined;

              // Foundation wires the anchor's native `onClick` to `onSelect`, so
              // this receives the click event at runtime despite the `() => void`
              // type. Mirror ActionWrapper's client-navigation handling: for a
              // `clientNavigation` action, suppress the browser's full-page load
              // on a plain left click so `onActivated` can perform the in-app
              // route transition. Modified clicks (cmd/ctrl/shift/alt) fall
              // through to the browser (open in a new tab) and skip the handler.
              const onSelect = (event?: React.MouseEvent) => {
                if (href && clientNavigation && event) {
                  if (!isPlainLeftClick(event)) {
                    return;
                  }
                  event.preventDefault();
                }
                item.onActivated?.onActivated(
                  includeMenuItemTelemetry
                    ? { menuItemId: item.id, availableMenuItemIds: menuItemIds }
                    : undefined,
                );
                setMenuOpen(false);
              };
              return href ? (
                <MenuItem
                  key={item.id}
                  as="a"
                  href={href}
                  value={item.id}
                  title={item.text}
                  leading={leading}
                  onSelect={onSelect}
                />
              ) : (
                <MenuItem
                  key={item.id}
                  value={item.id}
                  title={item.text}
                  leading={leading}
                  onSelect={onSelect}
                />
              );
            })}
          </MenuSection>
        </Menu>
      </PopoverContent>
    </Popover>
  );
}

export default SduiOverflowMenu;
