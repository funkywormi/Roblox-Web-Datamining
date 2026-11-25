import { useQuery } from "@tanstack/react-query";
import { getOSClass } from "@rbx/branding-assets";
import androidAppIcon from "@rbx/branding-assets/images/app_icons/app_icon_android_1024.svg";
import iosAppIcon from "@rbx/branding-assets/images/app_icons/app_icon_ios_1024.svg";
import macAppIcon from "@rbx/branding-assets/images/app_icons/app_icon_mac_1024.svg";
import windowsAppIcon from "@rbx/branding-assets/images/app_icons/app_icon_windows_1024.svg";
import { window } from "@rbx/core-lib/browser";
import { Card, clsx, IconButton } from "@rbx/foundation-ui";
import { assetUrl } from "@rbx/www-common/asset";
import type { ImportedAsset } from "@rbx/www-common/asset";
import { useLocale } from "@rbx/www-common/i18n";
import { appDownloadBannerSource, appDownloadType } from "./constants";
import type { AppsFlyerDownloadParams } from "./mobileStoreOneLink";
import { onAppDownloadClick, resolveAppDownload } from "./resolveAppDownload";
import type { ResolvedAppDownload } from "./resolveAppDownload";
import TokenizedDownloadButton from "./TokenizedDownloadButton";
import { useAppDownloadTranslate } from "./useAppDownloadTranslate";

export type AppDownloadBannerPlatform = "windows" | "mac" | "mobile";

export type AppDownloadBannerProps = {
  /** Picks the copy, the layout and the download. */
  platform: AppDownloadBannerPlatform;
  /** Called on a "Get" click, before the download starts. */
  onGetClick?: () => void;
  /** Called on close; the banner does not hide itself. */
  onDismiss: () => void;
  /** Sent with the deferred-deeplink token on desktop downloads. */
  downloadSource: string;
  /** For the mobile store link's OneLink, such as where the app opens. Unset opens Home. */
  appsFlyerParams?: AppsFlyerDownloadParams;
  className?: string;
};

type CopyKeys = { titleKey: string; descriptionKey: string };

const copyByPlatform: Record<AppDownloadBannerPlatform, CopyKeys> = {
  windows: {
    titleKey: "Heading.AppDownloadBannerWindows",
    descriptionKey: "Description.AppDownloadBannerWindows",
  },
  mac: {
    titleKey: "Heading.AppDownloadBannerMac",
    descriptionKey: "Description.AppDownloadBannerMac",
  },
  mobile: {
    titleKey: "Heading.AppDownloadBannerMobile",
    descriptionKey: "Description.AppDownloadBannerMobile",
  },
};

const downloadTypeByPlatform = {
  windows: appDownloadType.WindowsDirectDownload,
  mac: appDownloadType.MacDirectDownload,
  mobile: undefined,
} as const satisfies Record<AppDownloadBannerPlatform, number | undefined>;

const desktopAppIcon = { windows: windowsAppIcon, mac: macAppIcon } as const;
const appIconClassName = "size-800 medium:size-1200 shrink-0";

type MobileGet = { download: ResolvedAppDownload | undefined; icon: ImportedAsset };

/**
 * Controlled app upsell banner: it renders while mounted and the caller owns dismissal. The copy,
 * the download, the spacing and the button sizes follow `platform`; the icon follows the viewport.
 * The mobile store and icon resolve after mount, so the server render and hydration agree. Needs a
 * `QueryClientProvider` and a `use-intl` provider with `appDownloadNamespaces`.
 */
function AppDownloadBanner({
  platform,
  onGetClick,
  onDismiss,
  downloadSource,
  appsFlyerParams,
  className,
}: AppDownloadBannerProps) {
  const translate = useAppDownloadTranslate();
  const isMobile = platform === "mobile";
  const copy = copyByPlatform[platform];
  const title = translate(copy.titleKey);
  const locale = useLocale();
  // The store link is translated and `?downloadType=` can override it, so both key the result.
  const search = window?.location.search ?? "";
  const { data: mobileGet } = useQuery({
    queryKey: ["app-download-banner", "mobile-get", locale, search],
    queryFn: (): MobileGet => {
      const download = resolveAppDownload({ translate });
      return {
        download: download?.isDirectDownload ? undefined : download,
        icon: getOSClass() === "android" ? androidAppIcon : iosAppIcon,
      };
    },
    enabled: isMobile,
    staleTime: Infinity,
  });

  const icon = isMobile ? mobileGet?.icon : desktopAppIcon[platform];

  const handleGetClick = (download: ResolvedAppDownload) => {
    onAppDownloadClick(download, { source: appDownloadBannerSource });
    onGetClick?.();
  };

  // A Card rather than Banner: Banner caps the text at 280px and clamps it to two lines, but
  // Figma has the desktop description on one line.
  return (
    <Card
      variant="Emphasis"
      density={isMobile ? "Default" : "Compact"}
      role="region"
      aria-label={title}
      // Square and edge-to-edge per Figma; desktop has a 12px/4px inset outside the Card padding.
      className={clsx("!radius-none", !isMobile && "padding-x-medium padding-y-xsmall", className)}
    >
      <div className="flex items-center gap-medium">
        {icon ? (
          <img src={assetUrl(icon)} alt="" className={appIconClassName} />
        ) : (
          <span aria-hidden="true" className={appIconClassName} />
        )}
        <div className="flex flex-col fill min-width-0">
          <div className="text-title-medium content-emphasis text-truncate-end text-no-wrap">
            {title}
          </div>
          <div
            className={clsx(
              "text-body-small content-default",
              isMobile ? "clip max-height-[2lh]" : "text-truncate-end text-no-wrap",
            )}
          >
            {translate(copy.descriptionKey)}
          </div>
        </div>
        <div className="flex items-center shrink-0 gap-medium medium:gap-small">
          {(!isMobile || mobileGet?.download) && (
            <TokenizedDownloadButton
              text={translate("Action.AppDownloadBannerGet")}
              variant="Standard"
              size={isMobile ? "Small" : "Medium"}
              className="min-width-1200 medium:min-width-1600"
              download={isMobile ? mobileGet?.download : undefined}
              downloadTypeOverride={downloadTypeByPlatform[platform]}
              downloadSource={downloadSource}
              appsFlyerParams={appsFlyerParams}
              onClick={handleGetClick}
            />
          )}
          <IconButton
            icon="icon-regular-x"
            ariaLabel={translate("Action.AppDownloadBannerDismiss")}
            variant="Utility"
            size={isMobile ? "Medium" : "Small"}
            isCircular={!isMobile}
            onClick={onDismiss}
          />
        </div>
      </div>
    </Card>
  );
}

export default AppDownloadBanner;
