import React, { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Popover, Link, IconButton, Button } from "@rbx/core-ui";
import serverListConstants from "../constants/serverListConstants";
import urlConstants from "../constants/urlConstants";
import CancelServerModal from "./CancelServerModal";
import serverListService from "../services/serverListService";
import useCurrentTab from "../../gameData/hooks/useCurrentTab";

const { resources } = serverListConstants;
const { getPrivateServerConfigUrl } = urlConstants;

function GameInstanceMenu({
  className,
  translate,
  gameId,
  vipServerId,
  isOwner,
  canManagePlace,
  shutdownServer,
  subscription,
  setSubscription,
  isLoading,
  systemFeedbackService,
  universeId,
}) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const isVipServer = vipServerId > 0;
  const canConfigure = isVipServer && isOwner;
  const isActiveGameInstance = gameId !== null;
  const isServersSectionWebview = useCurrentTab() == null;

  // Shutdowns can occur on
  // -- live game instances that are *not* private servers by any user who can manage the place
  // -- live game instances that are private servers by the owner of the private server
  const canShutdown = isActiveGameInstance && ((!isVipServer && canManagePlace) || canConfigure);

  const canCancel = canConfigure && subscription.active;
  const closeCancelModal = () => setShowCancelModal(false);

  if (!canConfigure && !canShutdown) {
    return <Fragment />;
  }
  return (
    <div className={className}>
      <Popover
        id="game-instance-dropdown-menu"
        button={<IconButton iconName="more" size={IconButton.sizes.small} isDisabled={isLoading} />}
        trigger="click"
        placement="bottom"
      >
        <ul className="dropdown-menu" role="menu">
          {canConfigure && (
            <li>
              <Link
                url={getPrivateServerConfigUrl(
                  vipServerId,
                  isServersSectionWebview ? universeId : undefined,
                )}
                className="rbx-private-server-configure"
              >
                {translate(resources.configureServerText)}
              </Link>
            </li>
          )}

          {canShutdown && (
            <li>
              <button
                type="button"
                onClick={shutdownServer}
                className="rbx-private-server-shutdown rbx-private-server-shutdown"
              >
                {translate(resources.shutdownServerText)}
              </button>
            </li>
          )}

          {canCancel && (
            <li>
              <Button
                className="rbx-private-server-cancel"
                onClick={() => setShowCancelModal(true)}
                size={Button.sizes.default}
                width={Button.widths.full}
                variant={Button.variants.default}
                isDisabled={isLoading}
              >
                {translate(resources.cancelText)}
              </Button>
            </li>
          )}
        </ul>
      </Popover>
      {canCancel && (
        <CancelServerModal
          translate={translate}
          showModal={showCancelModal}
          closeModal={closeCancelModal}
          expirationDate={new Date(subscription.expirationDate).toLocaleString("default", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          cancelPrivateServer={() =>
            serverListService.updateVipServerSubscription(vipServerId, false, subscription.price)
          }
          systemFeedbackService={systemFeedbackService}
          setSubscription={setSubscription}
        />
      )}
    </div>
  );
}

GameInstanceMenu.defaultProps = {
  className: "",
  gameId: null,
  vipServerId: 0,
  isOwner: false,
  canManagePlace: false,
  subscription: {},
  universeId: undefined,
};

GameInstanceMenu.propTypes = {
  className: PropTypes.string,
  translate: PropTypes.func.isRequired,
  gameId: PropTypes.string,
  vipServerId: PropTypes.number,
  isOwner: PropTypes.bool,
  canManagePlace: PropTypes.bool,
  shutdownServer: PropTypes.func.isRequired,
  subscription: PropTypes.shape({
    active: PropTypes.bool,
    expired: PropTypes.bool,
    expirationDate: PropTypes.string,
    price: PropTypes.number,
    canRenew: PropTypes.bool,
    hasInsufficientFunds: PropTypes.bool,
    hasRecurringProfile: PropTypes.bool,
    hasPriceChanged: PropTypes.bool,
  }),
  setSubscription: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  systemFeedbackService: PropTypes.shape({
    success: PropTypes.func.isRequired,
    warning: PropTypes.func.isRequired,
  }).isRequired,
  universeId: PropTypes.number,
};

export default GameInstanceMenu;
