"use client";
import React, { useCallback, useMemo, useState } from "react";
import { renderSduiNestedChild, type SduiManagedChildList } from "@rbx/sdui-core";
import "./sduiTileOverflowMenu.css";

/** Add to the tile root so hovering or keyboard focus anywhere in the tile reveals the menu. */
export const SDUI_TILE_OVERFLOW_MENU_HOST_CLASS = "sdui-tile-overflow-menu-host";

/** Whether keyboard focus is inside `element`. Unsupported `:focus-visible` throws, e.g. in jsdom. */
function hasKeyboardFocusWithin(element: Element): boolean {
  const focused = element.ownerDocument.activeElement;
  if (focused == null || !element.contains(focused)) {
    return false;
  }
  try {
    return focused.matches(":focus-visible");
  } catch {
    return false;
  }
}

type SduiTilePointerHoverHandlers = {
  onPointerEnter: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
  onFocusCapture: (event: React.FocusEvent<HTMLElement>) => void;
};

/**
 * Tracks whether a mouse hovers the tile, for `SduiTileOverflowMenu`'s direct
 * action. Spread `handlers` on the tile root. Touch and keyboard focus never
 * count as hovering, except focus on the direct action itself: swapping it out
 * would unmount the focused control.
 */
export function useSduiTilePointerHover(enabled: boolean): {
  isPointerHovering: boolean;
  handlers: SduiTilePointerHoverHandlers | undefined;
} {
  const [isPointerHovering, setIsPointerHovering] = useState(false);
  const handlers = useMemo<SduiTilePointerHoverHandlers | undefined>(
    () =>
      enabled
        ? {
            onPointerEnter: event => {
              setIsPointerHovering(
                event.pointerType !== "touch" && !hasKeyboardFocusWithin(event.currentTarget),
              );
            },
            onPointerLeave: () => {
              setIsPointerHovering(false);
            },
            onFocusCapture: event => {
              if (
                !event.target.closest("[data-sdui-tile-direct-action]") &&
                hasKeyboardFocusWithin(event.currentTarget)
              ) {
                setIsPointerHovering(false);
              }
            },
          }
        : undefined,
    [enabled],
  );
  return { isPointerHovering: enabled && isPointerHovering, handlers };
}

type SduiTileOverflowMenuProps = {
  /** The tile's OVERFLOW_MENU, unrendered so it can take local props. */
  overflowMenuComponent: SduiManagedChildList;
  /** Replaces the menu while a mouse hovers the tile and the menu is closed. */
  directActionComponent?: React.ReactNode;
  /** From `useSduiTilePointerHover`. */
  isPointerHovering: boolean;
  onOpenChange?: (isOpen: boolean, availableMenuItemIds: string[]) => void;
};

/**
 * A tile's overflow menu at the top-right of its media, shown on hover or
 * keyboard focus. Web equivalent of lua-apps `SduiTileOverflowMenu`: the menu
 * gets the over-media trigger and item telemetry through local props.
 */
export function SduiTileOverflowMenu({
  overflowMenuComponent,
  directActionComponent,
  isPointerHovering,
  onOpenChange,
}: SduiTileOverflowMenuProps): React.JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const onMenuOpenChange = useCallback(
    (isOpen: boolean, availableMenuItemIds: string[]) => {
      setIsMenuOpen(isOpen);
      onOpenChange?.(isOpen, availableMenuItemIds);
    },
    [onOpenChange],
  );
  const overflowMenu = useMemo(
    () =>
      renderSduiNestedChild(overflowMenuComponent, {
        isOverMedia: true,
        includeMenuItemTelemetry: true,
        onOpenChange: onMenuOpenChange,
      }),
    [overflowMenuComponent, onMenuOpenChange],
  );
  const showDirectAction = directActionComponent != null && isPointerHovering && !isMenuOpen;

  return (
    <div className="sdui-tile-overflow-menu" data-testid="sdui-tile-overflow-menu">
      {showDirectAction ? (
        <div data-sdui-tile-direct-action="" data-testid="sdui-tile-direct-action">
          {directActionComponent}
        </div>
      ) : (
        overflowMenu
      )}
    </div>
  );
}
