import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Popover, IconButton } from 'react-style-guide';
import { eventStreamService } from 'core-roblox-utilities';
import ClassNames from 'classnames';
import AdsActionMenu from './AdsActionMenu';
import { formattedNumber, costPerAction } from '../utils/calculation';
import { adsStatus } from '../constants/adsListConstant';
import CampaignDetailPanel from './CampaignDetailPanel';
import events from '../constants/adsListEventStreamConstant';

function CampaignRow({ translate, intl, campaign, campaignTarget, handleStopAdClicked }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandClicked = () => {
    setIsExpanded(true);
    eventStreamService.sendEvent(events.expandAdDetail);
  };

  const handleCollapseClicked = () => {
    setIsExpanded(false);
    eventStreamService.sendEvent(events.foldAdDetail);
  };

  const renderExpandedPanel = ad => {
    return (
      <CampaignDetailPanel
        translate={translate}
        intl={intl}
        ad={ad}
        campaignTarget={campaignTarget}
        handleStopAdClicked={handleStopAdClicked}
        isExpanded={isExpanded}
        onCollapseDetailPanel={handleCollapseClicked}
      />
    );
  };

  const renderRegularRow = ad => {
    const tableId = `${ad.adId}-row`;
    const adState = ad.adSetStatus.toLowerCase();
    const isShowMenu = adState !== adsStatus.stopped && adState !== adsStatus.completed;
    const classNames = ClassNames('fullwidth regular-info-row', { collapse: isExpanded });
    return (
      <table className={classNames} id={tableId}>
        <tbody>
          <tr>
            <td>
              <div className='div-table-cell long-table-cell word-wrap'>{ad.adName}</div>
              <div className='div-table-cell short-table-cell'>{ad.adSetStatus}</div>
              <div className='div-table-cell medium-table-cell'>
                <span className='item-value'>
                  <span className='icon-robux-16x16' />
                  <span>{formattedNumber(ad.totalSpendInRobux)}</span>
                </span>
              </div>
              <div className='div-table-cell medium-table-cell'>
                <span className='item-value'>
                  <span className='icon-robux-16x16' />
                  <span>{costPerAction(ad.totalSpendInRobux, ad.totalClicks)}</span>
                </span>
              </div>
              <div className='div-table-cell medium-table-cell'>
                <span className='item-value'>
                  <span className='icon-robux-16x16' />
                  <span>{costPerAction(ad.totalSpendInRobux, ad.totalConversions)}</span>
                </span>
              </div>
              <div className='div-table-cell icon-container'>
                {isShowMenu && (
                  <Popover
                    id='ad-action'
                    trigger='click'
                    placement='bottom'
                    containerPadding={20}
                    button={
                      <IconButton
                        id='ad-action-more'
                        className='roblox-popover-close'
                        iconName='more'
                      />
                    }>
                    <ul id='ad-action-popover-menu' className='dropdown-menu'>
                      <AdsActionMenu
                        translate={translate}
                        adSetId={ad.adSetId}
                        onItemClicked={handleStopAdClicked}
                      />
                    </ul>
                  </Popover>
                )}
              </div>
              <div className='div-table-cell icon-container'>
                <IconButton iconName='down' onClick={() => handleExpandClicked(ad.adId)} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <tr key={campaign.adId}>
      <td colSpan='7'>
        {renderRegularRow(campaign)}
        {renderExpandedPanel(campaign)}
      </td>
    </tr>
  );
}

CampaignRow.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    getDateTimeFormatter: PropTypes.func.isRequired
  }).isRequired,
  campaign: PropTypes.shape({
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
  }).isRequired,
  campaignTarget: PropTypes.shape({
    name: PropTypes.string,
    targetType: PropTypes.string,
    targetId: PropTypes.number
  }).isRequired,
  handleStopAdClicked: PropTypes.func.isRequired
};

export default CampaignRow;
