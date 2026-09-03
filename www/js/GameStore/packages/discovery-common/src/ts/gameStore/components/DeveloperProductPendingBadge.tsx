import React from "react";
import { Tooltip } from "@rbx/core-ui";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { CheckCircleOutlineOutlined } from "@mui/icons-material";
import { FeatureDeveloperProducts } from "../../common/constants/translationConstants";

type TDeveloperProductPendingBadgeProps = {
  count: number;
  translate: TranslateFunction;
  productId: number;
};

const DeveloperProductPendingBadge = ({
  count,
  translate,
  productId,
}: TDeveloperProductPendingBadgeProps): JSX.Element | null => {
  return (
    <Tooltip
      content={translate(FeatureDeveloperProducts.LabelPendingMessageTooltip)}
      placement="right"
      id={`pending-icon-${productId}`}
    >
      <div className="pending-badge">
        <span className="pending-icon">
          <CheckCircleOutlineOutlined />
        </span>
        <span className="pending-count">{count}</span>
      </div>
    </Tooltip>
  );
};

export default DeveloperProductPendingBadge;
