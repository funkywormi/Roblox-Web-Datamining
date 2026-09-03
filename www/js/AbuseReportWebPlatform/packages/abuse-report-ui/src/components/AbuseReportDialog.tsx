import React, { useState, useEffect } from "react";
import { SheetRoot, SheetContent, SheetTitle, IconButton } from "@rbx/foundation-ui";
import { Intl } from "@rbx/core-scripts/legacy/Roblox";
import useAbuseSheetFlow from "../hooks/abuseSheetFlow/useAbuseSheetFlow";
import { RawConfig } from "../hooks/abuseSheetFlow/types";
import { ArTranslationProvider, useArTranslation } from "../util/translate/arTranslation";
import { AbuseReportAnalyticsProvider } from "../analytics/AbuseReportAnalyticsContext";
import { fetchCachedConfig } from "../api/fetchConfig";
import { retryNTimes } from "../util/retry";
import ErrorSheet from "./ErrorSheet";
import DisclosureInfoButton from "./DisclosureInfoButton";
import { sendConfigApiErrorEvent, sendRuntimeErrorEvent } from "../analytics/analyticsService";
import ErrorBoundary from "./ErrorBoundary";
import { LayoutSlotsProvider, sheetSlots } from "./LayoutSlots";
import { LoaderProvider, type LoaderRegistry } from "../loaders/LoaderContext";

const EMPTY_LOADERS: LoaderRegistry = {};

export interface AbuseReportDialogProps {
  abuseVector: string;
  targetIdStr: string;
  open: boolean;
  onClose: () => void;
  onCloseAutoFocus?: () => void;
  loaders?: LoaderRegistry;
}

export interface AbuseReportDialogWithConfigProps {
  config: RawConfig;
  abuseVector: string;
  targetIdStr: string;
  open: boolean;
  onClose: () => void;
  onCloseAutoFocus?: () => void;
  loaders?: LoaderRegistry;
}

/**
 * If we expect there is a decent chance that the AbuseReportDialog will be shown,
 * We can prefetch the config to provide a better user experience.
 * We'll rely on the cache system to avoid making duplicate requests.
 */
export const prefetchAbuseUI = ({
  abuseVector,
  targetIdStr,
}: {
  abuseVector: string;
  targetIdStr: string;
}): void => {
  const locale = new Intl().getRobloxLocale();
  fetchCachedConfig(targetIdStr, abuseVector, locale)
    .then(() => {
      // do nothing, but make eslint happy
    })
    .catch(() => {
      // do nothing, but make eslint happy
    });
};

/**
 * Inner component that uses the ArTranslation context.
 */
const AbuseReportDialogInner = ({
  open,
  onClose,
  config,
  abuseVector,
  targetIdStr,
  onCloseAutoFocus,
  loaders,
}: {
  open: boolean;
  onClose: () => void;
  config: RawConfig;
  abuseVector: string;
  targetIdStr: string;
  onCloseAutoFocus?: () => void;
  loaders?: LoaderRegistry;
}): React.ReactElement => {
  const {
    currentPageElement,
    onClose: onCloseSheet,
    config: normalizedConfig,
    canGoBack,
    goBack,
    isSubmitting,
    analytics,
    currentNode,
  } = useAbuseSheetFlow(config, {
    onClose,
    open,
    abuseVector,
    targetId: targetIdStr,
  });

  const { translateToStringOnly } = useArTranslation();

  const disclosure = normalizedConfig.display.titleDisclosure;

  return (
    <LoaderProvider loaders={loaders ?? EMPTY_LOADERS} open={open}>
      <AbuseReportAnalyticsProvider analytics={analytics}>
        <LayoutSlotsProvider slots={sheetSlots}>
          <SheetRoot
            open={open}
            onOpenChange={nextOpen => {
              if (!nextOpen) {
                onCloseSheet();
              }
            }}
          >
            <SheetContent
              centerSheetSize="Medium"
              closeLabel={translateToStringOnly(normalizedConfig.display.closeButtonLabel)}
              largeScreenVariant="center"
              mobilePortraitClassName="height-[90vh]"
              largeScreenClassName="height-[calc(min(700px,50vh))] min-height-[500px]"
              onCloseAutoFocus={onCloseAutoFocus}
              onOpenAutoFocus={evt => {
                // TODO: [future] handle this better. Currently needed to avoid closing the DisclosureInfoButton early (abech).
                evt.preventDefault();
              }}
            >
              <SheetTitle
                navigation={
                  canGoBack ? (
                    <IconButton
                      icon="icon-filled-chevron-large-left"
                      size="Medium"
                      onClick={goBack}
                      ariaLabel="Back"
                      variant="Utility"
                      isDisabled={isSubmitting}
                    />
                  ) : undefined
                }
                utilities={
                  disclosure ? (
                    <DisclosureInfoButton
                      ariaLabel={translateToStringOnly(disclosure.ariaLabel ?? "")}
                      closeLabel={translateToStringOnly(disclosure.closeButtonLabel)}
                      title={translateToStringOnly(disclosure.tooltipTitle)}
                      text={translateToStringOnly(disclosure.tooltipText)}
                      buttonLabel={
                        disclosure.buttonLabel && translateToStringOnly(disclosure.buttonLabel)
                      }
                      defaultOpen={disclosure.openByDefault}
                    />
                  ) : undefined
                }
                visuallyHideTitleText
              >
                {currentNode.eyebrow ? translateToStringOnly(currentNode.eyebrow) : null}
              </SheetTitle>
              {currentPageElement}
            </SheetContent>
          </SheetRoot>
        </LayoutSlotsProvider>
      </AbuseReportAnalyticsProvider>
    </LoaderProvider>
  );
};

/**
 * Show Abuse Report (AR) Dialog which lets user submit an AR report.
 *
 * You're expect to to control the open/close state of the dialog.
 *
 * Example usage:
 * ```tsx
 * const [open, setOpen] = useState(false);
 * return (
 *   <div>
 *     <Button onClick={() => setOpen(true)}>Report Abuse</Button>
 *     <AbuseReportDialog
 *       abuseVector="user-profile"
 *       targetIdStr="123"
 *       open={open}
 *       onClose={() => setOpen(false)}
 *       onCloseAutoFocus={() =>
 *         // focus on the element that was focused before the dialog was opened
 *       }}
 *     />
 *   </div>
 * );
 * ```
 *
 * NOTE: avoid gating the whole dialog with a boolean, as this will break the animation/transitions
 * e.g. do NOT do  `{ open && <AbuseReportDialog open={open} onClose={onClose} /> }`
 *
 */
const AbuseReportDialog = ({
  abuseVector,
  targetIdStr,
  open,
  onClose,
  onCloseAutoFocus,
  loaders,
}: AbuseReportDialogProps): React.ReactElement | null => {
  const [config, setConfig] = useState<RawConfig | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (open) {
      const locale = new Intl().getRobloxLocale();
      setConfig(null);
      setHasError(false);
      retryNTimes(3, () => fetchCachedConfig(targetIdStr, abuseVector, locale))
        .then(data => {
          if (isActive) {
            setConfig(data);
            setHasError(false);
          }
        })
        .catch((err: unknown) => {
          if (isActive) {
            setHasError(true);
          }
          sendConfigApiErrorEvent(err, {
            abuse_vector: abuseVector,
            target_id: targetIdStr,
          });
        });
    }

    return () => {
      isActive = false;
    };
  }, [open, abuseVector, targetIdStr]);

  if (hasError) {
    return <ErrorSheet open={open} onClose={onClose} onCloseAutoFocus={onCloseAutoFocus} />;
  }

  if (!config) {
    return null;
  }

  return (
    <ErrorBoundary
      renderError={() => (
        <ErrorSheet open={open} onClose={onClose} onCloseAutoFocus={onCloseAutoFocus} />
      )}
      onError={(err, componentStack) => {
        sendRuntimeErrorEvent(err, componentStack, {
          abuse_vector: abuseVector,
          target_id: targetIdStr,
        });
      }}
    >
      <ArTranslationProvider translations={config.translations}>
        <AbuseReportDialogInner
          open={open}
          onClose={onClose}
          config={config}
          abuseVector={abuseVector}
          targetIdStr={targetIdStr}
          onCloseAutoFocus={onCloseAutoFocus}
          loaders={loaders}
        />
      </ArTranslationProvider>
    </ErrorBoundary>
  );
};

/**
 * AbuseReportDialogWithConfig component.
 * Config-based component that accepts config directly (useful for storybook/testing).
 */
export const AbuseReportDialogWithConfig = ({
  config,
  abuseVector,
  targetIdStr,
  open,
  onClose,
  onCloseAutoFocus,
  loaders,
}: AbuseReportDialogWithConfigProps): React.ReactElement => (
  <ArTranslationProvider translations={config.translations}>
    <AbuseReportDialogInner
      open={open}
      onClose={onClose}
      config={config}
      abuseVector={abuseVector}
      targetIdStr={targetIdStr}
      onCloseAutoFocus={onCloseAutoFocus}
      loaders={loaders}
    />
  </ArTranslationProvider>
);

export default AbuseReportDialog;
