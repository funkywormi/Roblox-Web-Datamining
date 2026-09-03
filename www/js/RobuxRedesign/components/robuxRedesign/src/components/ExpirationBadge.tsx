import { useTranslation } from "@rbx/core-scripts/react";
import { Badge } from "@rbx/foundation-ui";

export type ExpirationBadgeProps = {
  daysLeft: number;
};

export function ExpirationBadge({ daysLeft }: ExpirationBadgeProps) {
  const { translate } = useTranslation();

  return (
    <Badge
      variant="Contrast"
      label={
        daysLeft === 1
          ? translate("Label.LastDay", { daysLeft: 1 })
          : translate("Label.DaysLeft", { daysLeft })
      }
      className="shrink-0"
    />
  );
}
