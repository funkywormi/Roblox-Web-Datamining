import React, { useEffect, useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { profileTranslationConfig } from '../translation.config';
import currentWearingContants from '../constants/currentWearingContants';
import CurrentAvatar from '../components/CurrentAvatar';
import Accoutrements from '../components/Accoutrements';
import currentWearingService, { AssetDetail } from '../services/currentWearingService';

export const CurrentWearing = ({ translate }: WithTranslationsProps): JSX.Element => {
  const [assets, setAssets] = useState<Array<AssetDetail>>([]);
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const currentWearingAssets = await currentWearingService.getCurrentWearingAssets();
        setAssets(currentWearingAssets);
      } catch (err) {
        console.debug(err);
      }
    };
    // eslint-disable-next-line no-void
    void fetchAssets();
  }, []);
  return (
    <React.Fragment>
      <div className='container-header'>
        <h2>{translate(currentWearingContants.currentWearingTranslationMap.currentlyWearing)}</h2>
      </div>
      <CurrentAvatar />
      <Accoutrements assets={assets} />
    </React.Fragment>
  );
};

export default withTranslations(CurrentWearing, profileTranslationConfig);
