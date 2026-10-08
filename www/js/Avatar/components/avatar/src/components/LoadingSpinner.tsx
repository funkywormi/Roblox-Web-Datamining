import React from "react";
import { ProgressCircle } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";

function LoadingSpinner(): React.ReactElement {
  const t = useTranslations("Feature.Avatar");
  return (
    <div className="flex justify-center padding-y-medium">
      <ProgressCircle variant="Indeterminate" size="Small" ariaLabel={t("Message.Loading")} />
    </div>
  );
}

export default LoadingSpinner;
