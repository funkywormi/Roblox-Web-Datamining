import { Badge } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";

export type ExpirationBadgeProps = {
  daysLeft: number;
};

export function ExpirationBadge({ daysLeft }: ExpirationBadgeProps) {
  const translate = useTranslations("Feature.PersonalizedBonus");

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
