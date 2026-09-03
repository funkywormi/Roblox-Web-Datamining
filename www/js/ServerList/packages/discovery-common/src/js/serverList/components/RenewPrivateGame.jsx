import React, { Fragment, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { withTranslations } from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import serverListConstants from "../constants/serverListConstants";
import translationConfig from "../translation.config";
import RenewServerModal from "./RenewServerModal";
import serverListService from "../services/serverListService";

const { resources } = serverListConstants;

function RenewPrivateGame({
  translate,
  privateServerId,
  isPaymentCancelled,
  isInsufficientFunds,
  isServerInactive,
  canRenew,
  setSubscription,
  isLoading,
  systemFeedbackService,
  placeName,
  price,
  creatorName,
}) {
  const itemPurchaseDataElement = document.getElementById("ItemPurchaseAjaxData");
  const userBalanceFromDataAttribute =
    itemPurchaseDataElement?.getAttribute("data-user-balance-robux");
  const [userRobuxBalance, setUserRobuxBalance] = useState(userBalanceFromDataAttribute ?? null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  useEffect(() => {
    if (userRobuxBalance === null && authenticatedUser?.id) {
      serverListService.getCurrentUserBalance(authenticatedUser.id).then(
        data => {
          setUserRobuxBalance(data.robux);
          setIsBalanceLoading(false);
        },
        () => {
          setIsBalanceLoading(false);
        },
      );
    } else {
      setIsBalanceLoading(false);
    }
  }, []);
  const cannotAfford = userRobuxBalance !== null && userRobuxBalance < price;
  const renewPrivateServer = useCallback(() => {
    return new Promise(resolve => {
      serverListService
        .updateVipServerSubscription(privateServerId, true, price)
        .then(
          ({ data }) => {
            setSubscription(data);
            systemFeedbackService.success(
              translate(resources.renewSubscriptionSuccess) ||
                "Successfully renewed private server",
            );
          },
          ({ data }) => {
            if (data.errors?.length > 0) {
              const error = data.errors[0];
              systemFeedbackService.warning(error.userFacingMessage ?? error.message);
            } else {
              systemFeedbackService.warning(
                translate(resources.renewSubscriptionError) || "Unable to renew subscription.",
              );
            }
          },
        )
        .finally(() => {
          resolve();
        });
    });
  }, [privateServerId, price, setSubscription, translate, systemFeedbackService]);

  return (
    <Fragment>
      {isPaymentCancelled && (
        <div className="rbx-private-server-subscription-alert text-alert">
          <span className="rbx-private-server-subscription-alert-text">
            {translate(resources.renewalCanceledText) || "Renewal Canceled"}
          </span>
        </div>
      )}

      {isInsufficientFunds && (
        <div className="rbx-private-server-insufficient-funds text-alert">
          <span className="icon-remove" />
          {translate(resources.insufficientFunds)}
        </div>
      )}

      {cannotAfford && !isInsufficientFunds && (
        <div className="rbx-private-server-subscription-alert text-alert">
          <span className="icon-remove" />
          {translate(resources.headingInsufficientFunds)}
        </div>
      )}

      {isServerInactive && (
        <div className="rbx-private-server-inactive">
          <span className="icon-turn-off" />
          {translate(resources.inactiveServerText)}
        </div>
      )}

      {canRenew && (
        <RenewServerModal
          {...{
            placeName,
            creatorName,
            price,
            renewPrivateServer,
            isLoading,
            isDisabled: isBalanceLoading || cannotAfford,
          }}
        />
      )}
    </Fragment>
  );
}

RenewPrivateGame.propTypes = {
  translate: PropTypes.func.isRequired,
  privateServerId: PropTypes.number.isRequired,
  isPaymentCancelled: PropTypes.bool.isRequired,
  isInsufficientFunds: PropTypes.bool.isRequired,
  isServerInactive: PropTypes.bool.isRequired,
  canRenew: PropTypes.bool.isRequired,
  setSubscription: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  systemFeedbackService: PropTypes.shape({
    success: PropTypes.func.isRequired,
    warning: PropTypes.func.isRequired,
  }).isRequired,
  placeName: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  creatorName: PropTypes.string.isRequired,
};

export default withTranslations(RenewPrivateGame, translationConfig.serverList);
