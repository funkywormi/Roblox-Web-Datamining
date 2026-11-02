import React, { type ComponentProps, type ReactNode, useState } from "react";
import { Button, Dialog, DialogBody, DialogContent, Icon } from "@rbx/foundation-ui";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { installInstructionsDelayMs } from "./constants";
import { onAppDownloadClick, resolveAppDownload } from "./resolveAppDownload";
import type { ResolvedAppDownload, ResolveAppDownloadOptions } from "./resolveAppDownload";
import { useAppDownloadTranslate } from "./useAppDownloadTranslate";

type ButtonVariant = ComponentProps<typeof Button>["variant"];
type ButtonSize = ComponentProps<typeof Button>["size"];
type IconSize = ComponentProps<typeof Icon>["size"];

const iconSizeByButtonSize: Partial<Record<NonNullable<ButtonSize>, IconSize>> = {
  Large: "XLarge",
};

const buttonClassNameBySize: Partial<Record<NonNullable<ButtonSize>, string>> = {
  Large: "min-width-[240px] medium:min-width-[400px]",
};

export type DownloadButtonProps = {
  text?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  showIcon?: boolean;
  renderInstallInstructions?: (
    download: ResolvedAppDownload,
    translate: TranslateFunction,
  ) => ReactNode;
  isDisabled?: boolean;
  isVisible?: boolean;
  /**
   * When true, skip the Large-size min-width override. Defaults to false to
   * keep the download CTA Large styling.
   */
  useFoundationSize?: boolean;
  className?: ComponentProps<typeof Button>["className"];
  href?: string;
  target?: "_self" | "_blank";
  download?: ResolvedAppDownload;
  downloadTypeOverride?: ResolveAppDownloadOptions["downloadTypeOverride"];
  onClick?: (
    download: ResolvedAppDownload,
    event: React.MouseEvent<HTMLElement>,
  ) => void | Promise<void>;
};

function DownloadButton({
  text,
  variant = "Emphasis",
  size = "Small",
  showIcon = false,
  renderInstallInstructions,
  isDisabled = false,
  isVisible = true,
  useFoundationSize = false,
  className,
  href,
  target,
  download: downloadOverride,
  downloadTypeOverride,
  onClick,
}: DownloadButtonProps) {
  const translate = useAppDownloadTranslate();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isClickPending, setIsClickPending] = useState(false);
  const download =
    downloadOverride ??
    resolveAppDownload({
      downloadTypeOverride,
      translate,
    });

  if (!isVisible || !download) {
    return null;
  }

  const resolvedHref = href ?? download.href.toString();
  const linkTarget = target ?? (download.isDirectDownload ? "_self" : "_blank");
  const label = text ?? translate(download.link.title);
  const iconSize = iconSizeByButtonSize[size] ?? size;
  const sizeClassName = useFoundationSize ? undefined : buttonClassNameBySize[size];
  const buttonClassName = [sizeClassName, className].filter(Boolean).join(" ");
  const hasInstallInstructions = renderInstallInstructions != null;
  const isInteractionBlocked = isDisabled || isClickPending;

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    if (isInteractionBlocked) {
      return;
    }

    if (onClick) {
      setIsClickPending(true);
      try {
        await onClick(download, event);
      } finally {
        setIsClickPending(false);
      }
    } else {
      onAppDownloadClick(download);
    }

    if (download.isDirectDownload && hasInstallInstructions) {
      window.setTimeout(() => {
        setShowInstructions(true);
      }, installInstructionsDelayMs);
    }
  };

  return (
    <React.Fragment>
      <Button
        as="a"
        variant={variant}
        size={size}
        className={buttonClassName}
        href={isInteractionBlocked ? undefined : resolvedHref}
        target={linkTarget}
        rel={linkTarget === "_blank" ? "noopener noreferrer" : undefined}
        isDisabled={isDisabled}
        isLoading={isClickPending}
        onClick={event => {
          // eslint-disable-next-line no-void
          void handleClick(event);
        }}
      >
        <span className="flex justify-center items-center gap-small">
          {showIcon ? <Icon name={download.link.icon} size={iconSize} /> : null}
          <span>{label}</span>
        </span>
      </Button>
      {hasInstallInstructions ? (
        <Dialog
          open={showInstructions}
          size="Large"
          isModal
          hasCloseAffordance
          closeLabel={translate("Action.Close")}
          onOpenChange={() => {
            setShowInstructions(false);
          }}
        >
          <DialogContent className="install-dialog">
            <DialogBody className="content-default">
              {renderInstallInstructions(download, translate)}
            </DialogBody>
          </DialogContent>
        </Dialog>
      ) : null}
    </React.Fragment>
  );
}

export default DownloadButton;
