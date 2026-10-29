import { useCallback, type ReactNode } from "react";
import { InstallInstructionsWithTranslation } from "@rbx/app-download/InstallInstructions";
import TokenizedDownloadButton from "@rbx/app-download/TokenizedDownloadButton";
import type { ResolvedAppDownload } from "@rbx/app-download";
import type { DownloadButtonProps } from "@rbx/app-download/DownloadButton";
import type { SduiRendererInjectedProps, SduiResolvedAction } from "@rbx/sdui-core";
import { buildSduiAppsFlyerParams } from "./sduiAppsFlyerParams";

export interface SduiDownloadButtonProps extends SduiRendererInjectedProps {
  text?: string;
  variant?: DownloadButtonProps["variant"];
  size?: DownloadButtonProps["size"];
  showIcon?: boolean;
  showInstallInstructions?: boolean;
  isDisabled?: boolean;
  isVisible?: boolean;
  useFoundationSize?: boolean;
  /** AppsFlyer in-app destination. Unset keeps `roblox://navigation/home`. */
  afDp?: string;
  /** Web URL AppsFlyer opens when the app is not installed. */
  afWebDp?: string;
  /** AppsFlyer `deep_link_value`. Unset omits the parameter. */
  deepLinkValue?: string;
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
  afDp,
  afWebDp,
  deepLinkValue,
  onActivated,
  analyticsContext,
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
      appsFlyerParams={buildSduiAppsFlyerParams(analyticsContext, {
        afDp,
        afWebDp,
        deepLinkValue,
      })}
      onClick={onActivated ? handleActivated : undefined}
    />
  );
}
