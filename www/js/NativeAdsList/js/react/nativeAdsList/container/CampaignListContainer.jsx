import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Pagination, SimpleModal, Loading } from 'react-style-guide';
import { eventStreamService } from 'core-roblox-utilities';
import { DEFAULT_AD_STATE } from '../constants/adsListConstant';
import adsListService from '../services/adsListService';
import events from '../constants/adsListEventStreamConstant';
import CampaignsList from '../components/CampaignsList';

function CampaignListContainer({ translate, intl, campaignTarget, sponsoredCampaignType }) {
  const [adData, setAdsData] = useState(DEFAULT_AD_STATE);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [stopAdSetId, setStopAdSetId] = useState(-1);
  const [isLoadingShowing, setIsLoadingShowing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageCursor, setCurrentPageCursor] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentCampaignTarget, setCurrentCampaignTarget] = useState(campaignTarget);

  const modalBody = <p className='CancelModalBody'>{translate('Description.StopAds')}</p>;

  const handleFailure = error => {
    const data = error?.data;
    if (data && data.errors && data.errors[0]) {
      const { userFacingMessage } = data.errors[0];
      setErrorMessage(userFacingMessage);
    } else {
      setErrorMessage(translate('Message.UnknownError'));
    }
    setIsLoadingShowing(false);
  };

  const retrieveAds = (currentTarget, pageCursor) => {
    setIsLoadingShowing(true);
    adsListService
      .getAdsByCampaignTargetId(sponsoredCampaignType, currentTarget.targetId, pageCursor)
      .then(
        response => {
          if (response?.data) {
            setAdsData(response.data);
          }
          setIsLoadingShowing(false);
        },
        error => handleFailure(error)
      );
  };

  const handlePagination = newPage => {
    const { nextPageCursor, previousPageCursor } = adData;
    let targetCursor = null;
    if (newPage > currentPage && nextPageCursor) {
      // load next page
      targetCursor = nextPageCursor;
    } else if (newPage < currentPage && previousPageCursor) {
      // load prev page
      targetCursor = previousPageCursor;
    }

    if (targetCursor) {
      setCurrentPageCursor(targetCursor);
      setCurrentPage(newPage);
    }
  };

  const handleStopAdClicked = adSetId => {
    setShowWarningModal(true);
    setStopAdSetId(adSetId);
    eventStreamService.sendEvent(events.stopAdClick);
  };

  const handleConfirmStop = () => {
    setShowWarningModal(false);
    eventStreamService.sendEvent(events.stopAdConfirmed);
    adsListService.stopAds(stopAdSetId).then(
      () => retrieveAds(currentCampaignTarget),
      error => handleFailure(error)
    );
  };

  const handleDismissModal = () => {
    setShowWarningModal(false);
  };

  useEffect(() => {
    if (campaignTarget !== currentCampaignTarget) {
      setAdsData(DEFAULT_AD_STATE);
      setCurrentCampaignTarget(campaignTarget);

      if (!campaignTarget) {
        return;
      }
      const cursor = null;
      setCurrentPage(1);
      setCurrentPageCursor(cursor);
      retrieveAds(campaignTarget, cursor);
    }
  }, [campaignTarget]);

  useEffect(() => {
    if (!currentCampaignTarget || !currentPageCursor) {
      return;
    }
    retrieveAds(currentCampaignTarget, currentPageCursor);
  }, [currentPageCursor]);

  let campaigns = [];
  if (currentCampaignTarget) {
    campaigns = adData.sponsoredCampaigns ? adData.sponsoredCampaigns : adData.sponsoredGames;
  }

  return (
    <Fragment>
      <CampaignsList
        translate={translate}
        intl={intl}
        sponsoredCampaignType={sponsoredCampaignType}
        campaignTarget={currentCampaignTarget}
        campaigns={campaigns}
        errorMessage={errorMessage}
        handleStopAdClicked={handleStopAdClicked}
        isLoading={isLoadingShowing}
      />
      {isLoadingShowing && <Loading />}
      <Pagination
        current={currentPage}
        hasNext={!!adData.nextPageCursor}
        onChange={handlePagination}
      />
      {showWarningModal && (
        <SimpleModal
          show
          actionButtonShow
          body={modalBody}
          title={translate('Heading.StopWarning')}
          actionButtonText={translate('Action.Stop')}
          neutralButtonText={translate('Action.Cancel')}
          onClose={handleDismissModal}
          onNeutral={handleDismissModal}
          onAction={handleConfirmStop}
        />
      )}
    </Fragment>
  );
}

CampaignListContainer.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    n: PropTypes.func.isRequired,
    getDateTimeFormatter: PropTypes.func.isRequired
  }).isRequired,
  sponsoredCampaignType: PropTypes.string.isRequired,
  campaignTarget: PropTypes.shape({
    name: PropTypes.string,
    targetId: PropTypes.number,
    targetType: PropTypes.string
  }).isRequired
};

export default CampaignListContainer;
