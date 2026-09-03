import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-style-guide';
import { eventStreamService } from 'core-roblox-utilities';
import { authenticatedUser } from 'header-scripts';
import { EnvironmentUrls } from 'Roblox';
import { multiGetCanUserSponsor } from '../../../../ts/react/services/sponsoredCampaignDataService';
import SponsoredCampaignType from '../../../../ts/react/enums/sponsoredCampaignType';
import CampaignListContainer from './CampaignListContainer';
import CampaignTargetSwitch from '../components/CampaignTargetSwitch';
import { getCreateCatalogAdUrl } from '../constants/adsListUrlsConstant';
import events from '../constants/adsListEventStreamConstant';

const { adsApi } = EnvironmentUrls;

function Sponsorships({
  translate,
  intl,
  groupId,
  universeId,
  assetId,
  isCatalogSearchEnabled,
  optionalOwnersName
}) {
  const defaultSponsoredCampaignType = SponsoredCampaignType.CatalogAssets;

  const [ownerName, setOwnerName] = useState(null);
  const [sponsoredCampaignType, setSponsoredCampaignType] = useState(defaultSponsoredCampaignType);
  const [currentCampaignTarget, setCurrentCampaignTarget] = useState(null);
  const [canUserSponsorTarget, setCanUserSponsorTarget] = useState(false);

  useEffect(() => {
    if (optionalOwnersName) {
      setOwnerName(optionalOwnersName);
      return;
    }

    const newOwnerName = authenticatedUser?.name;
    if (newOwnerName !== null) {
      setOwnerName(newOwnerName);
    }
  }, []);

  // Update canUserSponsorTarget upon changing currentCampaignTarget.
  useEffect(() => {
    if (currentCampaignTarget === null || currentCampaignTarget === undefined) {
      return;
    }
    multiGetCanUserSponsor(currentCampaignTarget.targetType, [currentCampaignTarget.targetId]).then(
      response => {
        const canUserSponsor = response?.data?.[currentCampaignTarget.targetId] ?? false;
        setCanUserSponsorTarget(canUserSponsor);
      },
      () => {
        setCanUserSponsorTarget(false);
      }
    );
  }, [currentCampaignTarget]);

  const handleCampaignTargetChanged = target => {
    if (target && target.targetId !== currentCampaignTarget?.targetId) {
      setCurrentCampaignTarget(target);
    }
  };

  const handleCreateButtonClicked = () => {
    if (currentCampaignTarget) {
      window.open(getCreateCatalogAdUrl(currentCampaignTarget.targetId), '_blank');
      return;
    }
    eventStreamService.sendEvent(events.createBtnClicked);
  };

  const onTabChanged = id => {
    setSponsoredCampaignType(id);
    setCurrentCampaignTarget(null);
  };

  return (
    <div className='ads-list-content'>
      <div className='flex-vertical-center-container'>
        <h1>{translate('Heading.SponsoredAds')}</h1>
        <div className='right-button-panel'>
          <Button
            variant={Button.variants.cta}
            width={Button.widths.full}
            size={Button.sizes.medium}
            isDisabled={
              sponsoredCampaignType === SponsoredCampaignType.Experiences ||
              !currentCampaignTarget ||
              !canUserSponsorTarget
            }
            onClick={handleCreateButtonClicked}>
            {translate('Label.CreateSponsoredAd')}
          </Button>
        </div>
      </div>
      <p className='label-creators-creations'>
        {translate('Label.OwnersCreationsSelector', { ownerName }) || `${ownerName}'s Creations`}
      </p>
      <div className='flex-vertical-center-container header-dropdown-panel'>
        <div className='tab-container'>
          <CampaignTargetSwitch
            translate={translate}
            groupId={groupId}
            sponsoredCampaignType={sponsoredCampaignType}
            onCampaignTargetChanged={handleCampaignTargetChanged}
            onTabChanged={onTabChanged}
            universeId={universeId}
            assetId={assetId}
            isCatalogSearchEnabled={isCatalogSearchEnabled}
          />
          <CampaignListContainer
            translate={translate}
            intl={intl}
            sponsoredCampaignType={sponsoredCampaignType}
            campaignTarget={currentCampaignTarget}
          />
        </div>
      </div>
    </div>
  );
}

Sponsorships.defaultProps = {
  optionalOwnersName: ''
};

Sponsorships.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    n: PropTypes.func.isRequired,
    getDateTimeFormatter: PropTypes.func.isRequired
  }).isRequired,
  groupId: PropTypes.number.isRequired,
  universeId: PropTypes.number.isRequired,
  assetId: PropTypes.number.isRequired,
  isCatalogSearchEnabled: PropTypes.bool.isRequired,
  optionalOwnersName: PropTypes.string
};

export default Sponsorships;
