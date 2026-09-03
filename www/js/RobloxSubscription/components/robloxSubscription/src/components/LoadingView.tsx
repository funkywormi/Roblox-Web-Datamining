import { useTranslation } from "@rbx/core-scripts/react";
import { ProgressCircle } from "@rbx/foundation-ui";

import type { FC } from "react";

const LoadingView: FC = () => {
  const { translate } = useTranslation();

  return (
    <div className="margin-top-[240px] flex flex-col items-center">
      <ProgressCircle
        ariaLabel={translate("Label.Loading")}
        size="Medium"
        variant="Indeterminate"
      />
    </div>
  );
};

export default LoadingView;
