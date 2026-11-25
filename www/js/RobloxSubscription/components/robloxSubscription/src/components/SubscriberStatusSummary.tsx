import { useTranslation } from "@rbx/core-scripts/react";
import { Badge } from "@rbx/foundation-ui";
import { useMemo } from "react";

import type { FC } from "react";

export type SubscriberStatusSummaryProps = {
  activationTimestampMs: number;
  expirationTimestampMs: number;
  nextRenewalTimestampMs: number | null;
  hasFreeTrial: boolean;
  /** The server only lets granted Plus be upgraded, so an upgradeable membership is free. */
  isUpgradeable: boolean;
};

const SubscriberStatusSummary: FC<SubscriberStatusSummaryProps> = ({
  activationTimestampMs,
  expirationTimestampMs,
  nextRenewalTimestampMs,
  hasFreeTrial,
  isUpgradeable,
}) => {
  const { translate, intl } = useTranslation();
  const dateTimeFormatter = useMemo(() => intl.getDateTimeFormatter(), [intl]);
  // TODO(SUBS-4968): API may return `0` for no next renewal; align contract / OpenAPI upstream.
  const isCancelled = nextRenewalTimestampMs === null || nextRenewalTimestampMs === 0;

  const renderStatusBadge = () => {
    if (isCancelled) {
      return <Badge label={translate("Label.Status.AutoRenewOff")} variant="Warning" />;
    }
    if (hasFreeTrial) {
      return <Badge label={translate("Label.Status.Freetrial")} variant="Standard" />;
    }
    return <Badge label={translate("Label.Status.Active")} variant="Standard" />;
  };

  const formatDate = (timestampMs: number) =>
    dateTimeFormatter.getCustomDateTime(timestampMs, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const renderStatusText = () => {
    if (isUpgradeable) {
      const date = formatDate(expirationTimestampMs);
      // translate returns the fallback as is, so it carries the date itself.
      return translate("Description.FreePlusUntil", { date }, `Free Plus until ${date}`);
    }
    if (isCancelled) {
      return translate("Description.ActiveUntil", { date: formatDate(expirationTimestampMs) });
    }
    return translate("Description.SubscribedSince", { date: formatDate(activationTimestampMs) });
  };

  return (
    <div className="gap-x-small flex items-center">
      <span className="text-body-medium content-emphasis">{renderStatusText()}</span>
      {renderStatusBadge()}
    </div>
  );
};

export default SubscriberStatusSummary;
