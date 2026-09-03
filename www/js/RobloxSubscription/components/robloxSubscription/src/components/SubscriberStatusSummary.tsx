import { useTranslation } from "@rbx/core-scripts/react";
import { Badge } from "@rbx/foundation-ui";
import { useMemo } from "react";

import type { FC } from "react";

export type SubscriberStatusSummaryProps = {
  activationTimestampMs: number;
  expirationTimestampMs: number;
  nextRenewalTimestampMs: number | null;
  hasFreeTrial: boolean;
};

const SubscriberStatusSummary: FC<SubscriberStatusSummaryProps> = ({
  activationTimestampMs,
  expirationTimestampMs,
  nextRenewalTimestampMs,
  hasFreeTrial,
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

  return (
    <div className="gap-x-small flex items-center">
      <span className="text-body-medium content-emphasis">
        {isCancelled
          ? translate("Description.ActiveUntil", {
              date: dateTimeFormatter.getCustomDateTime(expirationTimestampMs, {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            })
          : translate("Description.SubscribedSince", {
              date: dateTimeFormatter.getCustomDateTime(activationTimestampMs, {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            })}
      </span>
      {renderStatusBadge()}
    </div>
  );
};

export default SubscriberStatusSummary;
