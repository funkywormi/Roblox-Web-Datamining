import React, { Fragment, useCallback, useState } from "react";
import { renderToString } from "react-dom/server";
import PropTypes from "prop-types";
import { withTranslations } from "@rbx/core-scripts/react";
import { Button, SimpleModal } from "@rbx/core-ui";
import translationConfig from "../translation.config";
import serverListConstants from "../constants/serverListConstants";

const { PriceLabel } = window.RobloxItemPurchase;
const { resources } = serverListConstants;

function RenewServerModal({
  translate,
  placeName,
  creatorName,
  price,
  renewPrivateServer,
  isLoading,
  isDisabled,
}) {
  const [showModal, setShowModal] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);

  const modalBody = (
    <Fragment>
      <p className="renew-server-modal-body-text">
        {translate(resources.confirmEnableFuturePaymentsText, {
          placeName,
          creatorName,
        })}
      </p>

      <p
        className="renew-server-modal-body-text"
        dangerouslySetInnerHTML={{
          __html: translate(resources.startRenewingPrivateServerPrice, {
            price: renderToString(<PriceLabel {...{ price }} />),
          }),
        }}
      />
    </Fragment>
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const onAction = useCallback(() => {
    closeModal();
    setIsRenewing(true);

    renewPrivateServer().finally(() => {
      setIsRenewing(false);
    });
  }, [renewPrivateServer]);

  return (
    <Fragment>
      <Button
        className="rbx-private-server-renew"
        onClick={() => setShowModal(true)}
        size={Button.sizes.extraSmall}
        width={Button.widths.full}
        variant={Button.variants.control}
        isDisabled={isDisabled || isLoading || isRenewing}
      >
        {translate(resources.renewServerListText)}
      </Button>
      <SimpleModal
        show={showModal}
        title={translate(resources.renewPrivateServerTitle)}
        body={modalBody}
        actionButtonText={translate(resources.renewServerListText)}
        neutralButtonText={translate(resources.cancelText)}
        onAction={onAction}
        onClose={closeModal}
        onNeutral={closeModal}
        actionButtonShow
      />
    </Fragment>
  );
}

RenewServerModal.propTypes = {
  translate: PropTypes.func.isRequired,
  placeName: PropTypes.string.isRequired,
  creatorName: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  renewPrivateServer: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
};

RenewServerModal.defaultProps = {
  isDisabled: false,
};

export default withTranslations(RenewServerModal, translationConfig.privateServer);
