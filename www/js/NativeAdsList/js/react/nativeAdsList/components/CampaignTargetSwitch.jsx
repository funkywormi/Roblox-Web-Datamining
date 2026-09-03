import { authenticatedUser } from 'header-scripts';
import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-style-guide';
import { eventStreamService } from 'core-roblox-utilities';
import CampaignTargetType from '../../../../ts/react/enums/campaignTargetType';
import SponsoredCampaignType from '../../../../ts/react/enums/sponsoredCampaignType';
import adsListService from '../services/adsListService';
import events from '../constants/adsListEventStreamConstant';
import {
  getRunningAndStoppedCampaignTargets,
  getSponsorableAssetTypeIds,
  searchAssetsForCreator
} from '../../../../ts/react/services/sponsoredCampaignDataService';
import {
  CreatorTypeToCatalogApiCreatorTypeValue,
  maxNumAssetsForSelector
} from '../../../../ts/react/constants/sponsoredCampaignConstants';
import CreatorType from '../../../../ts/react/enums/creatorType';
import CatalogApiSortType from '../../../../ts/react/enums/catalogApiSortType';

function CampaignTargetSwitch({
  translate,
  groupId,
  sponsoredCampaignType,
  onCampaignTargetChanged,
  onTabChanged,
  universeId,
  assetId,
  isCatalogSearchEnabled,
  ...otherProps
}) {
  const [selectedCampaignTarget, setSelectedCampaignTarget] = useState(null);
  const [campaignTargets, setCampaignTargets] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // NULL = not loaded
  const [runningAndStoppedAssetModels, setRunningAndStoppedAssetModels] = useState(null);
  const [eligibleAssetModels, setEligibleAssetModels] = useState(null);
  const [sponsorableAssetTypeIds, setSponsorableAssetTypeIds] = useState(null);

  const creatorTargetId = groupId || authenticatedUser.id;
  const creatorTargetType = groupId ? CreatorType.Group : CreatorType.User;

  // One-time, load sponsorable asset type IDs. One time only.
  useEffect(() => {
    getSponsorableAssetTypeIds().then(
      response => {
        setSponsorableAssetTypeIds(response?.data ?? []);
      },
      () => {
        setSponsorableAssetTypeIds([]);
      }
    );
  }, []);

  // Load eligibleCampaignTargetModels
  useEffect(() => {
    if (!sponsorableAssetTypeIds || sponsorableAssetTypeIds.length === 0) {
      return;
    }

    if (sponsoredCampaignType !== SponsoredCampaignType.CatalogAssets) {
      return;
    }

    if (eligibleAssetModels) {
      return;
    }

    if (!isCatalogSearchEnabled) {
      setEligibleAssetModels([]);
      return;
    }

    searchAssetsForCreator(
      sponsorableAssetTypeIds,
      creatorTargetId,
      CreatorTypeToCatalogApiCreatorTypeValue[creatorTargetType],
      maxNumAssetsForSelector,
      CatalogApiSortType.Updated
    ).then(
      response => {
        setEligibleAssetModels(
          response.data.data.map(asset => {
            const campaignTargetModel = {
              targetType: CampaignTargetType.Asset,
              targetId: asset.id,
              name: asset.name
            };
            return campaignTargetModel;
          })
        );
      },
      _errorResponse => {
        setEligibleAssetModels([]);
      }
    );
  }, [
    sponsoredCampaignType,
    sponsorableAssetTypeIds,
    creatorTargetId,
    creatorTargetType,
    eligibleAssetModels
  ]);

  // Load CampaignTargetModels for assets that have or had running campaigns.
  // These assets may not currently be eligible for new campaigns.
  useEffect(() => {
    if (sponsoredCampaignType !== SponsoredCampaignType.CatalogAssets) {
      return;
    }

    if (runningAndStoppedAssetModels) {
      return;
    }

    getRunningAndStoppedCampaignTargets(
      creatorTargetType === CreatorType.Group ? creatorTargetId : null,
      [CampaignTargetType.Asset]
    ).then(
      response => {
        const models = response.data.campaignTargetModels.map(model => {
          return {
            targetId: model.campaignTargetId,
            targetType: model.campaignTargetType,
            name: model.name
          };
        });
        setRunningAndStoppedAssetModels(models);
      },
      _errorResponse => {
        setRunningAndStoppedAssetModels([]);
      }
    );
  }, [sponsoredCampaignType, creatorTargetType, creatorTargetId, runningAndStoppedAssetModels]);

  //  On load completion for catalog avatar items.
  useEffect(() => {
    if (sponsoredCampaignType !== SponsoredCampaignType.CatalogAssets) {
      return;
    }

    if (!eligibleAssetModels || !runningAndStoppedAssetModels) {
      return;
    }

    // Deduplicate and merge runningAndStoppedAssetModels and eligibleAssetModels.
    const sortedDistinctCampaignTargetModels = [];
    const distinctAssetIds = new Set();
    runningAndStoppedAssetModels.concat(eligibleAssetModels).forEach(campaignTargetModel => {
      if (distinctAssetIds.has(campaignTargetModel.targetId)) {
        return;
      }
      distinctAssetIds.add(campaignTargetModel.targetId);
      sortedDistinctCampaignTargetModels.push(campaignTargetModel);
    });
    setCampaignTargets(sortedDistinctCampaignTargetModels);

    // set selectedCampaignTarget
    if (!sortedDistinctCampaignTargetModels || sortedDistinctCampaignTargetModels.length === 0) {
      return;
    }
    let selectedItem;
    if (assetId) {
      selectedItem = sortedDistinctCampaignTargetModels.find(
        capaignTarget => capaignTarget.targetId === assetId
      );
    } else {
      selectedItem = {
        name: sortedDistinctCampaignTargetModels[0].name,
        targetType: sortedDistinctCampaignTargetModels[0].targetType,
        targetId: sortedDistinctCampaignTargetModels[0].targetId
      };
    }
    if (!selectedCampaignTarget) {
      handleCampaignTargetChanged(selectedItem);
    }
  }, [sponsoredCampaignType, eligibleAssetModels, runningAndStoppedAssetModels]);

  const handleCampaignTargetChanged = target => {
    if (target?.targetId !== selectedCampaignTarget?.targetId) {
      setSelectedCampaignTarget(target);
      onCampaignTargetChanged(target);
    }
    eventStreamService.sendEvent(events.gameListClicked);
  };

  const handleErrorResponse = response => {
    const data = response?.data;
    if (data && data.errors && data.errors[0]) {
      const { userFacingMessage } = data.errors[0];
      setErrorMessage(userFacingMessage);
    } else {
      setErrorMessage(translate('Message.UnknownError'));
    }
  };

  // On sponsorship type tab change.
  useEffect(() => {
    onTabChanged(sponsoredCampaignType);

    // reset the campaign targets when the sponsorship type changes
    setSelectedCampaignTarget(null);
    setCampaignTargets(null);

    if (sponsoredCampaignType !== SponsoredCampaignType.Experiences) {
      return;
    }

    adsListService.getUniversesList(groupId).then(
      ({ data }) => {
        if (data.universes && data.universes.length > 0) {
          const games = [];
          let defaultGame = null;

          data.universes.forEach(universe => {
            const game = {
              name: universe.name,
              targetType: CampaignTargetType.Universe,
              targetId: universe.id
            };
            games.push(game);
            if (game.targetId === universeId) {
              defaultGame = game;
            }
          });

          setCampaignTargets(games);

          // preload with the most recently sponsored game
          if (!defaultGame) {
            defaultGame = {
              name: games[0].name,
              targetType: CampaignTargetType.Universe,
              targetId: games[0].targetId
            };
          }

          if (!selectedCampaignTarget) {
            setSelectedCampaignTarget(defaultGame);
            onCampaignTargetChanged(defaultGame);
          }
        }
        setErrorMessage(null);
      },
      response => handleErrorResponse(response)
    );
  }, [sponsoredCampaignType]);

  return (
    <Fragment>
      <label className='font-caption-header info-alert' htmlFor='campaign-switch-dropdown'>
        {sponsoredCampaignType === SponsoredCampaignType.Experiences
          ? translate('Label.SelectExperience')
          : translate('Label.CampaignTargetSelector')}
      </label>
      <Dropdown
        {...otherProps}
        currSelectionLabel={selectedCampaignTarget ? selectedCampaignTarget.name : ''}
        className='campaign-switch'
        id='campaign-switch-dropdown'>
        {campaignTargets &&
          campaignTargets.map(target => (
            <Dropdown.Item key={target.name} onClick={() => handleCampaignTargetChanged(target)}>
              {target.name}
            </Dropdown.Item>
          ))}
      </Dropdown>
      <div className='font-caption-header text-alert'>{errorMessage}</div>
    </Fragment>
  );
}

CampaignTargetSwitch.propTypes = {
  translate: PropTypes.func.isRequired,
  groupId: PropTypes.number.isRequired,
  sponsoredCampaignType: PropTypes.string.isRequired,
  onCampaignTargetChanged: PropTypes.func.isRequired,
  onTabChanged: PropTypes.func.isRequired,
  universeId: PropTypes.number.isRequired,
  assetId: PropTypes.number.isRequired,
  isCatalogSearchEnabled: PropTypes.bool.isRequired
};

export default CampaignTargetSwitch;
