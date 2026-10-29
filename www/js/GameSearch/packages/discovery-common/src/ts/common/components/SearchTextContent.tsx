import { MouseEvent, useCallback, useEffect, useMemo, useRef } from "react";
import { useSanitizedHtmlLinkText } from "@rbx/game-play-button";
import { observeVisibility } from "@rbx/core-scripts/util/element-visibility";
import { TOmniSearchTextDataModel } from "../types/bedev2Types";
import {
  extractFirstLinkUrl,
  SafetyResourceBannerAction,
  SafetyResourceBannerSurface,
  sendSafetyResourceBannerEvent,
  sendSafetyResourceBannerImpressionOnce,
  type TSafetyResourceBannerEventParams,
} from "../utils/safetyResourceBanner";

export default function SearchTextContent({
  textData,
}: {
  textData: TOmniSearchTextDataModel;
}): JSX.Element {
  const sanitizedText = useSanitizedHtmlLinkText(textData.name, {
    shouldOpenLinksInNewTab: true,
  });

  const { safetyResource } = textData;
  const eventFields = useMemo<Omit<TSafetyResourceBannerEventParams, "action"> | undefined>(() => {
    if (!safetyResource) {
      return undefined;
    }
    const url = extractFirstLinkUrl(sanitizedText);
    if (!url) {
      return undefined;
    }
    return {
      moderationCategory: safetyResource.moderationCategory,
      textFilterRequestId: safetyResource.textFilterRequestId,
      url,
      surface: SafetyResourceBannerSurface.Games,
    };
  }, [safetyResource, sanitizedText]);

  const containerRef = useRef<HTMLDivElement>(null);

  // The impression is sent once the banner is actually in the viewport, not on mount.
  useEffect(() => {
    const element = containerRef.current;
    if (!eventFields || !element) {
      return undefined;
    }
    return observeVisibility({ element }, isVisible => {
      if (isVisible) {
        sendSafetyResourceBannerImpressionOnce(eventFields);
      }
    });
  }, [eventFields]);

  const onClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!eventFields) {
        return;
      }
      const link = (event.target as Element).closest("a");
      if (!link) {
        return;
      }
      sendSafetyResourceBannerEvent({
        ...eventFields,
        action: SafetyResourceBannerAction.LinkTapped,
        url: link.getAttribute("href") ?? eventFields.url,
      });
    },
    [eventFields],
  );

  return (
    // The click handler only observes clicks on the sanitized links for telemetry.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      data-testid="games-search-search-text-content"
      className="games-search-search-text-content"
      ref={containerRef}
      onClick={onClick}
      // Sanitized via dompurify — safe to set innerHTML
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitizedText }}
    />
  );
}
