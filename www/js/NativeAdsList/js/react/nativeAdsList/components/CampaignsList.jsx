import React from 'react';
import PropTypes, { shape } from 'prop-types';
import { Tooltip } from 'react-style-guide';
import GeneralMessage from './GeneralMessage';
import translateKeysMapping from '../constants/adsTranslateConstant';
import CampaignRow from './CampaignRow';

function CampaignsList({
  translate,
  intl,
  sponsoredCampaignType,
  campaignTarget,
  campaigns,
  errorMessage,
  handleStopAdClicked,
  isLoading
}) {
  const showGeneralMessage = () => {
    let title = null;
    let description = null;
    if (errorMessage) {
      return <GeneralMessage title={title} description={description} />;
    }

    if (!campaignTarget) {
      // no game selected
      title = translate(translateKeysMapping[`${sponsoredCampaignType}_nothingselected`]);
      description = translate(translateKeysMapping[`${sponsoredCampaignType}_selectfromdropdown`]);
    } else if (campaigns.length === 0) {
      // no ads
      title = translate('Description.NoAds');
      description = translate('Description.CreateAdByButton');
    }

    return <GeneralMessage title={title} description={description} />;
  };

  return (
    <div className='ads-table'>
      <table className='table table-striped'>
        <thead>
          <tr>
            <th className='text-label long-table-cell'>{translate('Label.AdName')}</th>
            <th className='text-label short-table-cell'>{translate('Label.AdStatus')}</th>
            <th className='text-label medium-table-cell'>
              {translate('Label.AdSpend')}
              <Tooltip
                id='ctr-tooltip'
                placement='bottom'
                content={translate('Description.SpendTooltip')}>
                <span className='icon-moreinfo' />
              </Tooltip>
            </th>
            <th className='text-label medium-table-cell'>
              {translate('Label.AdCpc')}
              <Tooltip
                id='ctr-tooltip'
                placement='bottom'
                content={translate('Description.CpcTooltip')}>
                <span className='icon-moreinfo' />
              </Tooltip>
            </th>
            <th className='text-label medium-table-cell'>
              {translate('Label.AdCpp')}
              <Tooltip
                id='plays-tooltip'
                placement='bottom'
                content={translate(translateKeysMapping[`${sponsoredCampaignType}_cpptooltip`])}>
                <span className='icon-moreinfo' />
              </Tooltip>
            </th>
            <th className='empty-icon-container'>{}</th>
            <th className='empty-icon-container'>{}</th>
          </tr>
        </thead>
        <tbody>
          {!errorMessage &&
            campaigns.length > 0 &&
            campaigns.map(campaign => (
              <CampaignRow
                key={campaign.adId}
                translate={translate}
                intl={intl}
                campaign={campaign}
                campaignTarget={campaignTarget}
                handleStopAdClicked={handleStopAdClicked}
              />
            ))}
        </tbody>
      </table>
      {!isLoading && showGeneralMessage()}
      {errorMessage && <div className='section-content-off message-container'>{errorMessage}</div>}
    </div>
  );
}

CampaignsList.defaultProps = {
  errorMessage: null
};

CampaignsList.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    getDateTimeFormatter: PropTypes.func.isRequired
  }).isRequired,
  sponsoredCampaignType: PropTypes.string.isRequired,
  campaigns: PropTypes.arrayOf(
    shape({
      adId: PropTypes.number,
      adName: PropTypes.string,
      adSetId: PropTypes.number,
      adSetStatus: PropTypes.string,
      adStatus: PropTypes.string,
      bidAmountInRobux: PropTypes.number,
      budgetInRobux: PropTypes.number,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      targetGender: PropTypes.string,
      targetAgeBracket: PropTypes.string,
      targetDeviceType: PropTypes.string,
      totalSpendInRobux: PropTypes.number,
      totalImpressions: PropTypes.number,
      totalClicks: PropTypes.number,
      totalConversions: PropTypes.number
    })
  ).isRequired,
  campaignTarget: PropTypes.shape({
    name: PropTypes.string,
    targetType: PropTypes.string,
    targetId: PropTypes.number
  }).isRequired,
  errorMessage: PropTypes.string,
  handleStopAdClicked: PropTypes.func.isRequired,
  isLoading: PropTypes.func.isRequired
};

export default CampaignsList;
