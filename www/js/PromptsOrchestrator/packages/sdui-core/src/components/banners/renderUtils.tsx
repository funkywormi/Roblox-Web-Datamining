"use client";
import { clsx } from "clsx";
import { Button, type TSystemBannerSeverity, type TSystemBannerVariant } from "@rbx/foundation-ui";
import type { TTailwindBgClass } from "@rbx/foundation-tailwind/classes";
import { MAX_BANNER_ACTIONS } from "./constants";
import { toButtonVariant } from "../../utils/foundationEnums";
import type { SduiResolvedAction } from "../../types";
import "./bannerActions.css";

export type SduiBannerAction = {
  onActivated?: SduiResolvedAction;
  text?: string;
  variant?: string;
};

export type BannerActionStyleContext = {
  variant: TSystemBannerVariant;
  severity: TSystemBannerSeverity;
};

export type RenderBannerActionsOptions = {
  styleContext?: BannerActionStyleContext;
  /**
   * Stack the actions vertically once the banner is narrower than the XSmall breakpoint.
   * A banner opting in must also render `SDUI_BANNER_CONTAINER_CLASS` on its root: the
   * container query resolves against that ancestor and fails silently without it.
   */
  stacksWhenNarrow?: boolean;
};

export const SDUI_BANNER_CONTAINER_CLASS = "sdui-banner-container";

const EMPHASIS_ACTION_BACKGROUND_BY_SEVERITY: Record<TSystemBannerSeverity, TTailwindBgClass> = {
  Info: "bg-action-standard",
  Warning: "bg-inverse-action-standard",
  Success: "bg-inverse-action-standard",
  Error: "bg-action-standard",
};

const EMPHASIS_ACTION_COLOR_BY_SEVERITY: Record<TSystemBannerSeverity, string> = {
  Info: "var(--dark-mode-content-emphasis)",
  Warning: "var(--light-mode-content-emphasis)",
  Success: "var(--light-mode-content-emphasis)",
  Error: "var(--dark-mode-content-emphasis)",
};

export function renderBannerActions(
  actions: SduiBannerAction[] | undefined,
  { styleContext, stacksWhenNarrow = false }: RenderBannerActionsOptions = {},
) {
  if (!actions || actions.length === 0) return undefined;

  const isEmphasis = styleContext?.variant === "Emphasis";
  const emphasisColor = isEmphasis
    ? EMPHASIS_ACTION_COLOR_BY_SEVERITY[styleContext.severity]
    : undefined;

  return (
    <div
      className={clsx(
        "flex gap-small",
        // Mutually exclusive on purpose: `.sdui-banner-actions` supplies its own centering so
        // the container query can override it.
        stacksWhenNarrow ? "sdui-banner-actions" : "items-center",
      )}
    >
      {actions.slice(0, MAX_BANNER_ACTIONS).map(action => {
        const buttonVariant = toButtonVariant(action.variant, "Standard");

        const emphasisBackground =
          isEmphasis && buttonVariant === "Standard"
            ? EMPHASIS_ACTION_BACKGROUND_BY_SEVERITY[styleContext.severity]
            : undefined;

        const handleClick = () => {
          action.onActivated?.onActivated();
        };

        const href = action.onActivated?.href;

        return (
          <Button
            {...(href ? { as: "a" as const, href } : { as: "button" as const })}
            key={`${action.text}-${buttonVariant}`}
            className={emphasisBackground}
            size="Small"
            variant={buttonVariant}
            style={emphasisColor ? { color: emphasisColor } : undefined}
            onClick={handleClick}
          >
            {action.text}
          </Button>
        );
      })}
    </div>
  );
}
