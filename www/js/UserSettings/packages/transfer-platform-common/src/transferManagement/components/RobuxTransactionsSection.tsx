import type React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";
import translationConstants from "../../core/constants/translationConstants";

const TRANSACTION_HISTORY_URL = "/transactions";

/** The Robux tab's link to transaction history. */
const RobuxTransactionsSection = (): React.JSX.Element => {
  const { translate } = useTranslation();

  return (
    <div>
      <div className="container-header padding-top-xxlarge">
        <h2 className="setting-section-header">
          {translate(translationConstants.robuxTransactions)}
        </h2>
      </div>

      <div className="radius-large stroke-standard stroke-muted padding-x-large">
        <a
          href={TRANSACTION_HISTORY_URL}
          className="settings-list-item-container margin-none padding-medium"
        >
          <span className="setting-name text-title-medium">
            {translate(translationConstants.transactionHistory)}
          </span>
          <div className="settings-list-item-value-arrow">
            <Icon name="icon-regular-arrow-up-right-from-square" size="Medium" />
          </div>
        </a>
      </div>
    </div>
  );
};

export default RobuxTransactionsSection;
