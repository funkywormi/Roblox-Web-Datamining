import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Popover, IconButton } from 'react-style-guide';
import ClassNames from 'classnames';
import AdsActionMenu from './AdsActionMenu';
import CampaignPreviewTile from './CampaignPreviewTile';
import translateKeysMapping from '../constants/adsTranslateConstant';
import { formattedNumber, costPerAction } from '../utils/calculation';
import { adsStatus } from '../constants/adsListConstant';
import { GetSponsoredCampaignTypeForCampaignTargetType } from '../../../../ts/react/constants/sponsoredCampaignConstants';
import { TargetAgeBracket } from '../../../../ts/react/enums/targetAgeBracket';

function CampaignDetailPanel({
  translate,
  intl,
  ad,
  campaignTarget,
  handleStopAdClicked,
  isExpanded,
  onCollapseDetailPanel
}) {
  const sponsoredCampaignType = GetSponsoredCampaignTypeForCampaignTargetType(
    campaignTarget.targetType
  );

  const translateContent = str => {
    const items = str.split(',');
    const translated = items.map(item => {
      const itemKey = item.toLowerCase().trim();
      const translationKey = translateKeysMapping[itemKey];
      if (translationKey) {
        return translate(translationKey);
      }
      return '';
    });
    return translated.join(', ');
  };

  function translateAgeBracket(str) {
    const items = str.split(',');
    const translated = items.map(item => {
      switch (item.trim()) {
        case TargetAgeBracket.AgeUnder13:
          return translate('Label.UnderThirdteenTarget');
        case TargetAgeBracket.AgeOver13:
          return translate('Label.OverThirdteenTarget') || '13+';
        case TargetAgeBracket.Age13To16:
          return translate('Label.Age13To16Target') || '13-16';
        case TargetAgeBracket.AgeOver17:
          return translate('Label.Over17Target') || '17+';
        default:
          return '';
      }
    });
    return translated.join(', ');
  }

  const getTargetGendersTranslation = genders => {
    if (genders.male && genders.female) {
      return translate(translateKeysMapping.anyGender);
    }
    if (genders.male) {
      return translate(translateKeysMapping.male);
    }
    return translate(translateKeysMapping.female);
  };

  const getTargetingString = (targetGenderStr, targetAgeBracketStr) => {
    const genderMap = {};
    targetGenderStr
      .toLowerCase()
      .split(',')
      .forEach(gender => {
        genderMap[gender.trim()] = true;
      });

    return `${getTargetGendersTranslation(genderMap)}, ${translateAgeBracket(targetAgeBracketStr)}`;
  };

  const dateRangeStr = date => {
    const dateTimeFormatter = intl.getDateTimeFormatter();
    return dateTimeFormatter.getFullDate(new Date(date), ', ');
  };

  const adRatio = (num1, num2) => {
    if (!num2 || num2 === 0) {
      return intl.n(0, 'percent');
    }
    const ratio = num1 / num2;
    return intl.n(ratio, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    });
  };

  const tableId = `${ad.adId.toString()}-panel`;
  const adState = ad.adSetStatus.toLowerCase();
  const isShowMenu = adState !== adsStatus.stopped && adState !== adsStatus.completed;
  const classNames = ClassNames('fullwidth', { collapse: !isExpanded });
  return (
    <table className={classNames} id={tableId}>
      <tbody>
        <tr>
          <td>
            <div className='fullwidth detail-info-row'>
              <div className='div-table-row'>
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
                  <IconButton iconName='up' onClick={() => onCollapseDetailPanel(ad.adId)} />
                </div>
              </div>
            </div>
            <div className='detail-panel'>
              <CampaignPreviewTile translate={translate} campaignTarget={campaignTarget} />
              <div className='summary-panel'>
                <span className='font-header-1 header-indent'>
                  {translate('Heading.AdSummary')}
                </span>
                <span className='status-tag'>
                  {translate('Label.Status')}
                  <span className='font-header-2 status-text'>{ad.adSetStatus}</span>
                </span>
                <div className='target-panel flex-container'>
                  <div className='item-column'>
                    <div className='font-body text'>{translate('Label.Audience')}</div>
                    <div>{getTargetingString(ad.targetGender, ad.targetAgeBracket)}</div>
                    <div>{translateContent(ad.targetDeviceType)}</div>
                  </div>
                  <div className='item-column'>
                    <div>
                      <span className='font-body text'>{translate('Label.AdStartDate')}</span>
                      <span className='item-value font-header-2'>{dateRangeStr(ad.startDate)}</span>
                    </div>
                    <div>
                      <span className='font-body text'>{translate('Label.AdEndDate')}</span>
                      <span className='item-value font-header-2'>{dateRangeStr(ad.endDate)}</span>
                    </div>
                    <div>
                      <span className='font-body text'>{translate('Label.AdDailyBudget')}</span>
                      <span className='item-value font-header-2'>
                        <span className='icon-robux-16x16' />
                        <span>{formattedNumber(ad.bidAmountInRobux)}</span>
                      </span>
                    </div>
                    <div>
                      <span className='font-body text'>{translate('Label.AdTotalBudget')}</span>
                      <span className='item-value font-header-2'>
                        <span className='icon-robux-16x16' />
                        <span>{formattedNumber(ad.budgetInRobux)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className='rbx-divider' />
                <div className='impact-panel'>
                  <div className='font-header-1 header-indent'>{translate('Heading.AdImpact')}</div>
                  <div className='target-panel flex-container'>
                    <div className='item-column'>
                      <div>
                        <span className='font-body text'>
                          {translate('Label.AdSpend')}
                          <Tooltip
                            id='spend-tootip'
                            placement='bottom'
                            content={translate('Description.SpendTooltip')}>
                            <span className='icon-moreinfo' />
                          </Tooltip>
                        </span>
                        <span className='item-value font-header-2'>
                          <span className='icon-robux-16x16' />
                          <span>{formattedNumber(ad.totalSpendInRobux)}</span>
                        </span>
                      </div>
                      <div>
                        <span className='font-body text'>
                          {translate('Label.AdImpressions')}
                          <Tooltip
                            id='impressions-tooltip'
                            placement='bottom'
                            content={translate('Description.ImpressionsTooltipV2')}>
                            <span className='icon-moreinfo' />
                          </Tooltip>
                        </span>
                        <span className='item-value font-header-2'>
                          {formattedNumber(ad.totalImpressions)}
                        </span>
                      </div>
                      <div>
                        <span className='font-body text'>{translate('Label.AdClicks')}</span>
                        <span className='item-value font-header-2'>
                          <span>{formattedNumber(ad.totalClicks)}</span>
                        </span>
                      </div>
                      <div>
                        <span className='font-body text'>
                          {translate('Label.AdCTR')}
                          <Tooltip
                            id='plays-tooltip'
                            placement='bottom'
                            content={translate('Description.CtrTooltip')}>
                            <span className='icon-moreinfo' />
                          </Tooltip>
                        </span>
                        <span className='item-value font-header-2'>
                          {adRatio(ad.totalClicks, ad.totalImpressions)}
                          <span />
                        </span>
                      </div>
                      <div>
                        <span className='font-body text'>
                          {translate('Label.AdCpc')}
                          <Tooltip
                            id='plays-tooltip'
                            placement='bottom'
                            content={translate('Description.CpcTooltip')}>
                            <span className='icon-moreinfo' />
                          </Tooltip>
                        </span>
                        <span className='item-value font-header-2'>
                          <span className='icon-robux-16x16' />
                          <span>{costPerAction(ad.totalSpendInRobux, ad.totalClicks)}</span>
                        </span>
                      </div>
                    </div>
                    <div className='item-column'>
                      <div>
                        <span className='font-body text'>
                          {translate(translateKeysMapping[`${sponsoredCampaignType}_conversions`])}
                          <Tooltip
                            id='plays-tooltip'
                            placement='bottom'
                            content={translate(
                              translateKeysMapping[`${sponsoredCampaignType}_conversionstooltip`]
                            )}>
                            <span className='icon-moreinfo' />
                          </Tooltip>
                        </span>
                        <span className='item-value font-header-2'>
                          {formattedNumber(ad.totalConversions)}
                        </span>
                      </div>
                      <div>
                        <span className='font-body text sub-item'>
                          {translate('Label.ClickConversions')}
                          <Tooltip
                            id='click-conversions-tooltip'
                            placement='bottom'
                            content={translate(
                              translateKeysMapping[
                                `${sponsoredCampaignType}_clickconversiontooltip`
                              ]
                            )}>
                            <span className='icon-moreinfo' />
                          </Tooltip>
                        </span>
                        <span className='item-value font-header-2'>
                          {formattedNumber(ad.clickConversions)}
                        </span>
                      </div>
                      <div>
                        <span className='font-body text sub-item'>
                          {translate('Label.PostImpression')}
                          <Tooltip
                            id='impression-conversions-tooltip'
                            placement='bottom'
                            content={translate(
                              translateKeysMapping[
                                `${sponsoredCampaignType}_impressionconversiontooltip`
                              ]
                            )}>
                            <span className='icon-moreinfo' />
                          </Tooltip>
                        </span>
                        <span className='item-value font-header-2'>
                          {formattedNumber(ad.impressionConversions)}
                        </span>
                      </div>
                      <div>
                        <span className='font-body text'>
                          {translate('Label.AdConversionRate')}
                          <Tooltip
                            id='spend-tootip'
                            placement='bottom'
                            content={translate(
                              translateKeysMapping[`${sponsoredCampaignType}_conversionratetooltip`]
                            )}>
                            <span className='icon-moreinfo' />
                          </Tooltip>
                        </span>
                        <span className='item-value font-header-2'>
                          {adRatio(ad.totalConversions, ad.totalImpressions)}
                        </span>
                      </div>
                      <div>
                        <span className='font-body text'>
                          {translate('Label.AdCpp')}
                          <Tooltip
                            id='plays-tooltip'
                            placement='bottom'
                            content={translate(
                              translateKeysMapping[`${sponsoredCampaignType}_cpptooltip`]
                            )}>
                            <span className='icon-moreinfo' />
                          </Tooltip>
                        </span>
                        <span className='item-value font-header-2'>
                          <span className='icon-robux-16x16' />
                          <span>{costPerAction(ad.totalSpendInRobux, ad.totalConversions)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

CampaignDetailPanel.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    n: PropTypes.func.isRequired,
    getDateTimeFormatter: PropTypes.func.isRequired
  }).isRequired,
  ad: PropTypes.shape({
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
    totalConversions: PropTypes.number,
    clickConversions: PropTypes.number,
    impressionConversions: PropTypes.number
  }).isRequired,
  campaignTarget: PropTypes.shape({
    name: PropTypes.string,
    targetType: PropTypes.string,
    targetId: PropTypes.number
  }).isRequired,
  handleStopAdClicked: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onCollapseDetailPanel: PropTypes.func.isRequired
};

export default CampaignDetailPanel;
