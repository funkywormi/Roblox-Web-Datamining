import React from 'react';
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { Divider, Grid, Link, Typography } from '@rbx/ui';
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import { Icon } from '@rbx/foundation-ui';
import { TDeveloperProductDetails } from '../../common/types/types';
import { TGetGameDetails } from '../../common/types/bedev1Types';
import DeveloperProductDetailsBuyButton from './DeveloperProductDetailsBuyButton';
import DeveloperProductMetadataRow from './DeveloperProductMetadataRow';
import constants from '../../common/constants/constants';
import { FeatureDeveloperProducts } from '../../common/constants/translationConstants';

type DeveloperProductMetadataProps = {
  developerProductDetailsData: TDeveloperProductDetails;
  gameDetails: TGetGameDetails;
  translate: TranslateFunction;
  compact: boolean;
};

const DeveloperProductMetadata = ({
  compact,
  translate,
  developerProductDetailsData,
  gameDetails
}: DeveloperProductMetadataProps): JSX.Element => {
  
  const linkToGame = gameDetails.rootPlaceId
    ? constants.url.gameEDP(gameDetails.rootPlaceId.toString()).url
    : null;

  const buyButton = CurrentUser!.isAuthenticated ? (
    <DeveloperProductDetailsBuyButton
      developerProductDetailsData={developerProductDetailsData}
      gameDetails={gameDetails}
      translate={translate}
    />
  ) : null;

  const basePrice = developerProductDetailsData.UserBasePriceInRobux;
  const finalPrice = developerProductDetailsData.PriceInRobux;

  const priceTagAndBuyButton = (
    <React.Fragment>
      <DeveloperProductMetadataRow label={translate(FeatureDeveloperProducts.LabelPrice)}>
        <Grid container className='price-tag'>
          <div className="flex flex-row gap-small justify-start items-center">
            <div className="flex flex-row justify-start items-center gap-xsmall">
              <Icon name="icon-filled-robux" size='Medium' />
              <Typography>{finalPrice}</Typography>
            </div>
            {basePrice && basePrice > finalPrice && 
              <div className='flex flex-row justify-start items-center content-muted relative gap-xsmall'>
                <div className='robux-amount-strike-through' />
                <Icon name="icon-filled-robux" size='Small' />
                <Typography style={{fontSize: 18, fontWeight: 'normal'}}>{basePrice}</Typography>
              </div>
            }
          </div>
        </Grid>
        {compact ? null : buyButton}
      </DeveloperProductMetadataRow>
      {compact ? buyButton : null}
    </React.Fragment>
  );

  return (
    <Grid direction='column' className='metadata-container'>
        {linkToGame ? (
          <div className='link-to-game-container'>
            <DeveloperProductMetadataRow label={translate(FeatureDeveloperProducts.LabelFrom)}>
              <Link href={linkToGame} component='a'>
                {gameDetails.name}
              </Link>
            </DeveloperProductMetadataRow>
          </div>
        ) : null}
        <Divider orientation='horizontal' flexItem />
        {priceTagAndBuyButton}
        <DeveloperProductMetadataRow label={translate(FeatureDeveloperProducts.LabelType)}>
          <Typography>{translate(FeatureDeveloperProducts.LabelProduct)}</Typography>
        </DeveloperProductMetadataRow>
        <DeveloperProductMetadataRow label={translate(FeatureDeveloperProducts.LabelDescription)}>
          <Typography className='description'>{developerProductDetailsData.Description}</Typography>
        </DeveloperProductMetadataRow>
      </Grid>
  );
};

export default DeveloperProductMetadata;
