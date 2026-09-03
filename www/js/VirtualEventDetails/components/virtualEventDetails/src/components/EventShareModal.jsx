import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { Modal } from "@rbx/core-ui/legacy/react-style-guide";
import { translation } from "../translation.config";
import { getTranslationStringForKeyWithFallback } from "../constants";
import AnalyticsEvents from "../analytics";

import "../css/virtualEventDetails/virtualEventShareModal.scss";

function EventShareModal({ translate, show, close, eventId, universeId, attendanceCount }) {
  const getUrlTextToCopy = useMemo(() => {
    return `https://ro.blox.com/Ebh5?pid=share&is_retargeting=false&af_dp=roblox%3A%2F%2Fnavigation%2Fevent_details%3Feventid%3D${eventId}&af_web_dp=https%3A%2F%2F${window.location.hostname}%2Fevents%2F${eventId}`;
  }, [eventId]);

  const writeText = useCallback(() => {
    navigator.clipboard.writeText(getUrlTextToCopy).then(() => {
      close();
    });
    AnalyticsEvents.sendVirtualEventLinkCopiedEvent(
      eventId,
      universeId,
      getUrlTextToCopy,
      attendanceCount,
    );
  }, [close, getUrlTextToCopy, eventId, universeId, attendanceCount]);

  return (
    <Modal
      show={show}
      isOpen={show}
      onHide={close}
      className="virtual-event-share-event-modal"
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      scrollable="true"
      centered="true"
      backdrop
    >
      <Modal.Header useBaseBootstrapComponent>
        <div className="share-event-modal-title-container">
          <Modal.Title id="share-event-modal-title">
            {getTranslationStringForKeyWithFallback(translate, "ShareModalTitle")}
          </Modal.Title>
          <button
            type="button"
            className="share-event-cancel-btn btn-generic-close-md"
            title="Cancel"
            onClick={close}
          >
            <span className="icon-close" />
          </button>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="share-event-modal-body-container">
          <div className="text-description share-event-modal-body-text">
            {getTranslationStringForKeyWithFallback(translate, "ShareModalBody")}
          </div>
          <div className="share-event-cta-container">
            <input disabled className="copy-text-input" type="input" value={getUrlTextToCopy} />
            <button
              type="button"
              className="btn-primary-lg btn-full-width share-event-yes-button"
              onClick={writeText}
            >
              {getTranslationStringForKeyWithFallback(translate, "ShareModalLinkCopy")}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

EventShareModal.propTypes = {
  translate: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  eventId: PropTypes.string.isRequired,
  universeId: PropTypes.number.isRequired,
  attendanceCount: PropTypes.number.isRequired,
  show: PropTypes.bool.isRequired,
};

export default withTranslations(EventShareModal, translation);
