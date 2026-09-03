import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";

const GracefulDegradationBanner: React.FC = () => {
  const { translate } = useTranslation();
  return (
    <div className="padding-large margin-bottom-large margin-top-large rounded-medium stroke-standard">
      <div className="content-default text-body-large">
        {translate("Message.GracefulDegradation")}
      </div>
    </div>
  );
};

export default GracefulDegradationBanner;
