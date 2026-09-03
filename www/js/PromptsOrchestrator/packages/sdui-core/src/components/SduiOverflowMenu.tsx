"use client";
import React, { useState } from "react";
import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Menu,
  MenuSection,
  MenuItem,
} from "@rbx/foundation-ui";
import type { SduiRendererInjectedProps, SduiResolvedAction } from "../types";
import { isPlainLeftClick } from "../utils/navigation";

export interface SduiOverflowMenuItemData {
  id: string;
  text: string;
  onActivated?: SduiResolvedAction;
}

export type SduiOverflowMenuProps = SduiRendererInjectedProps & {
  items?: SduiOverflowMenuItemData[];
  buttonAriaLabel?: string;
};

// Hardcoded until the icon PR lands; a follow-up will wire server-driven icon
// customization (FoundationIconConfigProp) once that infra is on master.
// The literal is scanned by Tailwind content detection so the icon class ships.
const OVERFLOW_ICON = "icon-regular-three-dots-horizontal";

/**
 * Foundation overflow menu: IconButton trigger + Popover Menu of actions.
 * Flat `items` list in a single MenuSection (multi-section not supported yet).
 */
export function SduiOverflowMenu({
  items,
  buttonAriaLabel = "More options",
}: SduiOverflowMenuProps): React.JSX.Element | null {
  const [open, setOpen] = useState(false);

  // Default `items = []` only covers `undefined`. Until ArrayOfMenuItemProp is
  // fully resolved, a mis-built object (e.g. `{ array: [...] }`) must not crash
  // the parent feed via `.map`.
  const menuItems = Array.isArray(items) ? items : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton
          icon={OVERFLOW_ICON}
          ariaLabel={buttonAriaLabel}
          variant="Utility"
          onClick={(e: React.MouseEvent) => {
            // The menu is often nested inside a clickable tile (SduiGameTile
            // wraps its overlay in an <a href>). Prevent default so the trigger
            // click doesn't bubble to the parent anchor and navigate. Note that
            // preventDefault also suppresses Radix's built-in open-toggle
            // (composed with checkForDefaultPrevented), so drive `open` here.
            e.preventDefault();
            setOpen(prev => !prev);
          }}
        />
      </PopoverTrigger>
      <PopoverContent ariaLabel={buttonAriaLabel} side="bottom" align="end">
        <Menu>
          <MenuSection>
            {menuItems.map(item => {
              // Pure-navigation actions (LINK, OPEN_GAME_DETAILS, etc.) have no
              // click-time handler — their resolved `href` does the navigation.
              // Render those as an anchor so the link actually navigates, while
              // still invoking `onActivated` for telemetry. Mirrors SduiButton.
              const href = item.onActivated?.href;
              const clientNavigation = item.onActivated?.clientNavigation ?? false;

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
                item.onActivated?.onActivated();
                setOpen(false);
              };
              return href ? (
                <MenuItem
                  key={item.id}
                  as="a"
                  href={href}
                  value={item.id}
                  title={item.text}
                  onSelect={onSelect}
                />
              ) : (
                <MenuItem key={item.id} value={item.id} title={item.text} onSelect={onSelect} />
              );
            })}
          </MenuSection>
        </Menu>
      </PopoverContent>
    </Popover>
  );
}

export default SduiOverflowMenu;
