import { useRef } from "react";
import { EventContext } from "@rbx/unified-logging";
import { TranslateFunction, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { translations } from "../constants/translations";
import { TPlayabilityStatus } from "../types/playButtonTypes";
import { getPlayButtonContextualMessage } from "../utils/getPlayButtonContextualMessage";
import useContextualMessageImpression from "../hooks/useContextualMessageImpression";

export type TContextualMessageAnalyticsConfig = {
  universeId: string;
  pageContext: EventContext;
  attributionId: string;
};

export type TContextualMessageProps = {
  playabilityStatus: TPlayabilityStatus | undefined;
  shouldShowVpcPlayButtonUpsells: boolean | undefined;
  shouldShowNoticeAgreementIfPlayable?: boolean;
  unplayableDisplayText?: string | null;
  contextualMessageClassName?: string;
  analyticsConfig: TContextualMessageAnalyticsConfig;
};

const ContextualMessage = ({
  translate,
  playabilityStatus,
  shouldShowVpcPlayButtonUpsells,
  unplayableDisplayText,
  shouldShowNoticeAgreementIfPlayable,
  contextualMessageClassName = "contextual-message",
  analyticsConfig,
}: TContextualMessageProps & {
  translate: TranslateFunction;
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  const resolvedMessage = getPlayButtonContextualMessage(translate, {
    playabilityStatus,
    shouldShowVpcPlayButtonUpsells,
    shouldShowNoticeAgreementIfPlayable,
    unplayableDisplayText,
  });

  useContextualMessageImpression(containerRef, {
    universeId: analyticsConfig.universeId,
    playabilityStatus,
    pageContext: analyticsConfig.pageContext,
    attributionId: analyticsConfig.attributionId,
    contextualMessage: resolvedMessage?.message,
  });

  if (!resolvedMessage) {
    return null;
  }

  return (
    <span
      ref={containerRef}
      data-testid={resolvedMessage.testId}
      className={contextualMessageClassName}
    >
      {resolvedMessage.message}
    </span>
  );
};

export default withTranslations<TContextualMessageProps>(ContextualMessage, translations);
