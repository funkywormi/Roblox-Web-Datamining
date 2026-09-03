import { Badge } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

const UncheckedBadge = () => {
  const { translate } = useTranslation();
  return <Badge label={translate("Label.Unchecked")} variant="Neutral" />;
};

export default UncheckedBadge;
