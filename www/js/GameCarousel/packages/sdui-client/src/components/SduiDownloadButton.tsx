import { useCallback, type ReactNode } from "react";
import { InstallInstructionsWithTranslation, TokenizedDownloadButton } from "@rbx/app-download";
import type { DownloadButtonProps, ResolvedAppDownload } from "@rbx/app-download";
import type { SduiRendererInjectedProps, SduiResolvedAction } from "@rbx/sdui-core";

export interface SduiDownloadButtonProps extends SduiRendererInjectedProps {
  text?: string;
  variant?: DownloadButtonProps["variant"];
  size?: DownloadButtonProps["size"];
  showIcon?: boolean;
  showInstallInstructions?: boolean;
  isDisabled?: boolean;
  isVisible?: boolean;
  useFoundationSize?: boolean;
  onActivated?: SduiResolvedAction;
}

const renderInstallInstructions = (download: ResolvedAppDownload): ReactNode => (
  <InstallInstructionsWithTranslation downloadLink={download.link} />
);

export function SduiDownloadButton({
  text,
  variant,
  size,
  showIcon,
  showInstallInstructions,
  isDisabled,
  isVisible,
  useFoundationSize,
  onActivated,
}: SduiDownloadButtonProps) {
  const handleActivated = useCallback(() => {
    onActivated?.onActivated();
  }, [onActivated]);
  const renderInstallInstructionsCallback = showInstallInstructions
    ? renderInstallInstructions
    : undefined;

  return (
    <TokenizedDownloadButton
      text={text}
      variant={variant}
      size={size}
      showIcon={showIcon}
      renderInstallInstructions={renderInstallInstructionsCallback}
      isDisabled={isDisabled}
      isVisible={isVisible}
      useFoundationSize={useFoundationSize}
      href={onActivated?.href}
      onClick={onActivated ? handleActivated : undefined}
    />
  );
}
