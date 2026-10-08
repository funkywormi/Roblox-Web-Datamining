import { Badge } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";

const UncheckedBadge = () => {
  const t = useTranslations("CommonUI.Features");
  return <Badge label={t("Label.Unchecked")} variant="Neutral" />;
};

export default UncheckedBadge;
