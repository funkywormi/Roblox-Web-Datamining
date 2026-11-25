"use client";
import { useEffect, useState } from "react";
import {
  Toggle,
  togglePlacements,
  toggleSizes,
  type TTogglePlacement,
  type TToggleSize,
} from "@rbx/foundation-ui";
import type { SduiRendererInjectedProps, SduiResolvedAction } from "@rbx/sdui-core";

export interface SduiToggleProps extends SduiRendererInjectedProps {
  /**
   * Visible label, rendered by Foundation inside the `<label>` that wraps the
   * switch, so it is also the switch's accessible name. Omit it when the
   * template already renders the title as a sibling, and set `ariaLabel`.
   */
  label?: string;
  /**
   * Accessible name when there is no visible `label`, supplied by the server
   * via `ToggleSchema.WebProps.aria_label` (web-only, like IconButton).
   */
  ariaLabel?: string;
  isChecked?: boolean;
  isDisabled?: boolean;
  size?: string;
  placement?: string;
  onActivated?: SduiResolvedAction;
  testId?: string;
}

function resolveToggleSize(size: string | undefined): TToggleSize {
  return toggleSizes.find(candidate => candidate === size) ?? "Medium";
}

function resolveTogglePlacement(placement: string | undefined): TTogglePlacement {
  return togglePlacements.find(candidate => candidate === placement) ?? "End";
}

/**
 * Web SDUI wrapper around Foundation Toggle (`UiComponentType.TOGGLE`).
 *
 * Flip immediately, then wait for the write (and its page-entry refresh) so
 * the bound `isChecked` conditional can select the other action branch.
 * Disabled while that is in flight so a second click cannot reuse the stale
 * branch. Roll back if the write rejects. With no bound action it flips
 * locally, like a plain Foundation Toggle.
 */
export function SduiToggle({
  label,
  ariaLabel,
  isChecked = false,
  isDisabled = false,
  size,
  placement,
  onActivated,
  testId,
}: SduiToggleProps) {
  const [isOn, setIsOn] = useState(isChecked);
  const [isWritePending, setIsWritePending] = useState(false);

  useEffect(() => {
    setIsOn(isChecked);
  }, [isChecked]);

  // Foundation requires `label`, `aria-label`, or `aria-labelledby`.
  const labelProps = label ? { label, "aria-label": ariaLabel } : { "aria-label": ariaLabel ?? "" };

  return (
    <Toggle
      {...labelProps}
      data-testid={testId ?? "sdui-toggle"}
      size={resolveToggleSize(size)}
      placement={resolveTogglePlacement(placement)}
      isChecked={isOn}
      isDisabled={isDisabled || isWritePending}
      onCheckedChange={nextIsOn => {
        const previous = isOn;
        setIsOn(nextIsOn);
        if (!onActivated) return;
        setIsWritePending(true);
        // `onActivated.onActivated` is the same call with the rejection
        // swallowed, so only the awaitable form runs here: invoking both
        // would execute the write twice. The rejection is observed so the
        // toggle can roll back; this is not a query.
        // eslint-disable-next-line no-void, @rbx/promises/prefer-query-mutation -- resolved action rejection rolls the toggle back
        void onActivated.onActivatedAsync().then(
          () => {
            setIsWritePending(false);
          },
          () => {
            setIsOn(previous);
            setIsWritePending(false);
          },
        );
      }}
    />
  );
}
