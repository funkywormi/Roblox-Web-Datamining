import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { Loading } from 'react-style-guide';
import { adsListRootElementId, translation } from './app.config';
import Sponsorships from './container/Sponsorships';
import useAdsListMetadata from './hooks/useAdsListMetadata';
import { getSponsoredItemsPageInfo } from './services/adsListService';

const getRobloxGroupId = urlString => {
  try {
    if (typeof urlString !== 'string') {
      return undefined;
    }

    const regex = /\/group\/(\d+)/;

    const match = urlString.match(regex);

    if (match && match[1]) {
      const groupId = Number.parseInt(match[1], 10);

      if (!Number.isNaN(groupId)) {
        return groupId;
      }
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
};

const getRobloxAssetId = urlString => {
  try {
    const url = new URL(urlString);

    const assetIdValue = url.searchParams.get('assetId');

    if (assetIdValue !== null) {
      const assetIdNumber = Number.parseInt(assetIdValue, 10);

      if (!Number.isNaN(assetIdNumber)) {
        return assetIdNumber;
      }
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
};

function App({ translate, intl }) {
  const [groupIdInUrl, setGroupIdInUrl] = useState();
  const [assetIdInUrl, setAssetIdInUrl] = useState();
  const [isLoadingShowing, setIsLoadingShowing] = useState(true);
  const [fetchedOwnersName, setFetchedOwnersName] = useState();
  const metadata = useAdsListMetadata(adsListRootElementId);

  useEffect(() => {
    const groupIdInUrlFound = getRobloxGroupId(window?.location?.href || '');

    setGroupIdInUrl(groupIdInUrlFound);

    const assetIdInUrlFound = getRobloxAssetId(window?.location?.href || '');
    setAssetIdInUrl(assetIdInUrlFound);

    if (!groupIdInUrlFound) {
      setIsLoadingShowing(false);
    }

    if (groupIdInUrlFound) {
      getSponsoredItemsPageInfo(groupIdInUrlFound).then(res => {
        const { data = {} } = res;
        const { name } = data;
        setFetchedOwnersName(name);
        setIsLoadingShowing(false);
      });
    } else {
      setIsLoadingShowing(false);
    }
  }, []);

  if (isLoadingShowing) {
    return <Loading />;
  }

  return (
    <Sponsorships
      translate={translate}
      intl={intl}
      groupId={groupIdInUrl}
      universeId={metadata.universeId}
      assetId={assetIdInUrl}
      isCatalogSearchEnabled
      optionalOwnersName={fetchedOwnersName}
    />
  );
}

App.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    n: PropTypes.func.isRequired,
    getDateTimeFormatter: PropTypes.func.isRequired
  }).isRequired
};
export default withTranslations(App, translation);
