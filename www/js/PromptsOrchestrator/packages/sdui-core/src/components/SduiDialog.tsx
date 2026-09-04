"use client";

import React, { type ComponentType } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeroMedia,
  DialogTitle,
  clsx,
  dialogSizes,
  type TDialogSize,
} from "@rbx/foundation-ui";
import { coerceToAllowedValue } from "../utils/foundationEnums";
import type { SduiRendererInjectedProps, SduiResolvedAction, SduiTokenOrLiteral } from "../types";
import {
  isSduiFoundationIconClass,
  type SduiFoundationIconClass,
} from "../foundation/sduiFoundationIcons";

const DEFAULT_IMAGE_ASPECT_RATIO = 16 / 9;
const DEFAULT_CLOSE_LABEL = "Close";
const ACTION_BUTTON_SIZE = "Medium";

export type SduiDialogImageProps = {
  image: string;
  aspectRatio: number;
  alt: string;
  imageStyle?: SduiTokenOrLiteral | null;
};

export type SduiDialogProps = SduiRendererInjectedProps & {
  size?: string;
  image?: string;
  imageStyle?: SduiTokenOrLiteral | null;
  /**
   * Aspect ratio of the image
   * @default 16 / 9
   */
  imageAspectRatio?: number;
  /**
   * Accessible text for the image
   * @default ""
   */
  imageAltText?: string;
  imageComponent?: ComponentType<SduiDialogImageProps>;
  titleText?: string;
  bodyText?: string;
  bodyComponent?: React.ReactNode;
  actionsLabel?: string;
  /**
   * If the actions should be stacked vertically or horizontally.
   * @default "Horizontal"
   */
  actionsOrientation?: string;
  primaryButtonAction?: SduiResolvedAction;
  primaryButtonText?: string;
  /**
   * @deprecated Use primaryButtonFoundationIcon instead.
   */
  primaryButtonIcon?: unknown;
  primaryButtonFoundationIcon?: SduiFoundationIconClass;
  primaryButtonSideEffectAction?: SduiResolvedAction;
  secondaryButtonAction?: SduiResolvedAction;
  secondaryButtonText?: string;
  /**
   * @deprecated Use secondaryButtonFoundationIcon instead.
   */
  secondaryButtonIcon?: unknown;
  secondaryButtonFoundationIcon?: SduiFoundationIconClass;
  secondaryButtonSideEffectAction?: SduiResolvedAction;
  onClose?: SduiResolvedAction;
  /**
   * Accessible label for the close button. Required when onClose is provided.
   * @default "Close"
   */
  closeLabel?: string;
  /**
   * Whether to show a backdrop behind the dialog.
   * @default true
   */
  hasBackdrop?: boolean;
};

const hasButtonContent = (
  action: SduiResolvedAction | undefined,
  text: string | undefined,
  icon: unknown,
): boolean => {
  return action != null || text != null || icon != null;
};

/**
 * Foundation `Button` only accepts a Tailwind icon class, so the deprecated
 * `IconProp` is used only when it already resolved to one and the foundation icon is not provided.
 */
const resolveButtonIcon = (
  foundationIcon: SduiFoundationIconClass | undefined,
  deprecatedIcon: unknown,
): SduiFoundationIconClass | undefined => {
  if (foundationIcon != null) {
    return foundationIcon;
  }
  return isSduiFoundationIconClass(deprecatedIcon) ? deprecatedIcon : undefined;
};

const asAnchorOrButton = (href: string | undefined) =>
  href ? ({ as: "a", href } as const) : ({ as: "button" } as const);

/**
 * SDUI wrapper around Foundation Dialog. Image rendering is injected by
 * environment-specific packages.
 */
export function SduiDialog({
  size,
  image,
  imageStyle,
  imageAspectRatio,
  imageAltText = "",
  imageComponent: ImageComponent,
  titleText,
  bodyText,
  bodyComponent,
  actionsLabel,
  actionsOrientation,
  primaryButtonAction,
  primaryButtonText,
  primaryButtonIcon,
  primaryButtonFoundationIcon,
  primaryButtonSideEffectAction,
  secondaryButtonAction,
  secondaryButtonText,
  secondaryButtonIcon,
  secondaryButtonFoundationIcon,
  secondaryButtonSideEffectAction,
  onClose,
  closeLabel = DEFAULT_CLOSE_LABEL,
  hasBackdrop,
}: SduiDialogProps): React.JSX.Element {
  const resolvedSize = coerceToAllowedValue<TDialogSize>(size, dialogSizes, "Medium");
  // isModal should default to true unless explicitly set to false
  const isModal = hasBackdrop !== false;
  const hasCloseAffordance = onClose != null;

  const primaryIcon = resolveButtonIcon(primaryButtonFoundationIcon, primaryButtonIcon);
  const secondaryIcon = resolveButtonIcon(secondaryButtonFoundationIcon, secondaryButtonIcon);

  const hasPrimaryButton = hasButtonContent(primaryButtonAction, primaryButtonText, primaryIcon);
  const hasSecondaryButton = hasButtonContent(
    secondaryButtonAction,
    secondaryButtonText,
    secondaryIcon,
  );
  const hasFooter = hasPrimaryButton || hasSecondaryButton;
  const isVerticalActions = actionsOrientation === "Vertical";
  // Side-by-side actions split the row evenly; stacked ones keep their intrinsic height.
  const actionButtonClassName = isVerticalActions ? undefined : "fill basis-0";

  const hasHeroMedia = image != null && image.length > 0 && ImageComponent != null;
  const hasBody = bodyComponent != null || (bodyText != null && bodyText.length > 0);
  const hasTitle = titleText != null && titleText.length > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose?.onActivated();
    }
  };

  const handlePrimaryClick = () => {
    if (primaryButtonAction != null) {
      primaryButtonAction.onActivated();
      // Only trigger the side effect if there is a primary action
      primaryButtonSideEffectAction?.onActivated();
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryButtonAction != null) {
      secondaryButtonAction.onActivated();
      // Only trigger the side effect if there is a secondary action
      secondaryButtonSideEffectAction?.onActivated();
    }
  };

  return (
    <Dialog
      size={resolvedSize}
      isModal={isModal}
      open
      onOpenChange={handleOpenChange}
      hasCloseAffordance={hasCloseAffordance}
      closeLabel={closeLabel}
    >
      <DialogContent>
        {hasHeroMedia && (
          <DialogHeroMedia>
            <ImageComponent
              image={image}
              aspectRatio={imageAspectRatio ?? DEFAULT_IMAGE_ASPECT_RATIO}
              alt={imageAltText}
              imageStyle={imageStyle}
            />
          </DialogHeroMedia>
        )}
        {(hasTitle || hasBody) && (
          <DialogBody className="flex flex-col gap-y-xsmall">
            <DialogTitle className="text-heading-medium margin-none">{titleText}</DialogTitle>
            {bodyComponent ??
              (hasBody && <div className="text-body-medium content-default">{bodyText}</div>)}
          </DialogBody>
        )}
        {hasFooter && (
          <DialogFooter className="flex flex-col gap-small">
            <div className={clsx("flex gap-small", isVerticalActions ? "flex-col" : "flex-row")}>
              {hasPrimaryButton && (
                <Button
                  {...asAnchorOrButton(primaryButtonAction?.href)}
                  variant="Emphasis"
                  size={ACTION_BUTTON_SIZE}
                  className={actionButtonClassName}
                  onClick={handlePrimaryClick}
                  icon={primaryIcon}
                >
                  {primaryButtonText}
                </Button>
              )}
              {hasSecondaryButton && (
                <Button
                  {...asAnchorOrButton(secondaryButtonAction?.href)}
                  variant="Standard"
                  size={ACTION_BUTTON_SIZE}
                  className={actionButtonClassName}
                  onClick={handleSecondaryClick}
                  icon={secondaryIcon}
                >
                  {secondaryButtonText}
                </Button>
              )}
            </div>
            {actionsLabel && <span className="text-body-small content-muted">{actionsLabel}</span>}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
