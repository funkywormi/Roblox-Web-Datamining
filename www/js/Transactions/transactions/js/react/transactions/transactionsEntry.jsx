import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import {
  rootElementId,
  rootElementLegacyId,
  groupTransactionsContainerId,
  groupRevenueSalesHash,
  groupConfigurePathname,
  groupRevenueCommissionsHash,
  groupRevenuePublishingAdvanceRebatesHash
} from './app.config';
import '../../../css/transactions.scss';
import '../../../css/tailwind.css';
import App from './App';
import GroupTransactionsApp from './GroupTransactionsApp';

ready(() => {
  const rootElement =
    document.getElementById(rootElementId) || document.getElementById(rootElementLegacyId);
  if (rootElement) {
    render(<App />, rootElement);
  }

  let retryAttempts = 10;
  const retryGettingTransactionsMountNode = () => {
    const groupTransactionsContainer = document.getElementById(groupTransactionsContainerId);
    if (!groupTransactionsContainer && retryAttempts > 0) {
      retryAttempts -= 1;
      setTimeout(retryGettingTransactionsMountNode, 200);
    } else if (groupTransactionsContainer) {
      const { targetid, transactiontype } = groupTransactionsContainer.dataset;
      render(
        <GroupTransactionsApp targetId={targetid} transactionType={transactiontype} />,
        groupTransactionsContainer
      );
    }
  };

  const isGroupConfigurePage = () => {
    return window.location.pathname.toLowerCase().indexOf(groupConfigurePathname) > -1;
  };

  // This runs on page load, if the user lands on #!/revenue/sales
  if (isGroupConfigurePage()) {
    retryGettingTransactionsMountNode();

    window.onhashchange = () => {
      if (
        window.location.hash === groupRevenueSalesHash ||
        window.location.hash === groupRevenueCommissionsHash ||
        window.location.hash === groupRevenuePublishingAdvanceRebatesHash
      ) {
        const groupTransactionsContainer = document.getElementById(groupTransactionsContainerId);
        if (groupTransactionsContainer) {
          const { targetid, transactiontype } = groupTransactionsContainer.dataset;
          render(
            <GroupTransactionsApp targetId={targetid} transactionType={transactiontype} />,
            groupTransactionsContainer
          );
        }
      }
    };
  }
});
