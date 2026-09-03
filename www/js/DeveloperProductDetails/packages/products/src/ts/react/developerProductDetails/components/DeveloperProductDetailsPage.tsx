import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Thumbnail2d,
  ThumbnailFormat,
  ThumbnailGamePassIconSize,
  ThumbnailTypes
} from '@rbx/thumbnails';
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { usePlayabilityStatus } from "@rbx/game-play-button";
import { Container, Grid } from '@rbx/ui';
import { Loading } from "@rbx/core-ui/legacy/react-style-guide";
import { developerProductsTranslationConfig } from '../translation.config';
import DeveloperProductTitle from './DeveloperProductTitle';
import { TDeveloperProductDetails } from '../../common/types/types';
import { TGetGameDetails } from '../../common/types/bedev1Types';
import { getDeveloperProductDetails } from '../services/developerProductDetailsService';
import { getGameDetails } from '../../common/services/bedev1Services';
import DeveloperProductMetadata from './DeveloperProductMetadata';

const DeveloperProductDetailsPage = ({ translate }: WithTranslationsProps): JSX.Element => {
  const WINDOW_BREAKPOINT_QUERY = '(max-width: 768px)';

  const [screenSizeMatch, setScreenSizeMatch] = useState(
    window.matchMedia(WINDOW_BREAKPOINT_QUERY)
  );
  useEffect(() => {
    const handleWindowResize = () => {
      setScreenSizeMatch(window.matchMedia(WINDOW_BREAKPOINT_QUERY));
    };
    window.addEventListener('resize', handleWindowResize);
    return () => { window.removeEventListener('resize', handleWindowResize); };
  }, []);

  const { universeId, productId } = useParams<{ universeId: string; productId: string }>();

  const { isPlayable, isFetchingPlayability } = usePlayabilityStatus(universeId ?? '');

  const [productDetails, setProductDetails] = useState<TDeveloperProductDetails | null>(null);
  const [gameDetails, setGameDetails] = useState<TGetGameDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // load product details only after playability is confirmed
  useEffect(() => {
    if (isPlayable !== true) return;
    if (productId && universeId) {
      getDeveloperProductDetails(productId)
        .then(data => {
          if (data.UniverseId === null || data.UniverseId.toString() === universeId) {
            setProductDetails(data);
          }
        })
        .catch(() => {
          /* intentionally empty */
        })
        .finally(() => { setIsLoading(false); });
    } else {
      setIsLoading(false);
    }
  }, [productId, universeId, isPlayable]);

  // load game details only after playability is confirmed
  useEffect(() => {
    if (isPlayable !== true || !universeId) return;
    getGameDetails(universeId)
      .then(data => { setGameDetails(data); })
      .catch(() => {
        /* intentionally empty */
      });
  }, [universeId, isPlayable]);

  if (isFetchingPlayability) return <Loading />;
  if (!isPlayable) return <React.Fragment />;
  if (isLoading) return <Loading />;
  if (!productDetails) return <React.Fragment />;

  const thumbnailHolder = (
    <div className='thumbnail-holder'>
      <Thumbnail2d
        type={ThumbnailTypes.developerProductIcon}
        size={ThumbnailGamePassIconSize.size150}
        targetId={productDetails?.TargetId}
        format={ThumbnailFormat.webp}
        altName={productDetails?.Name}
        imgClassName='thumbnail gear-passes-asset'
      />
    </div>
  );

  if (screenSizeMatch.matches) {
    // format for small mobile screens
    return (
      <Container
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        maxWidth={'md' as any /* Overwrite strict type check for "Breakpoint" */}
        className='developer-product-details-page-container small-screen'>
        <DeveloperProductTitle developerProductDetailsData={productDetails} translate={translate} />
        {thumbnailHolder}
        {gameDetails && (
          <DeveloperProductMetadata
            translate={translate}
            developerProductDetailsData={productDetails}
            gameDetails={gameDetails}
            compact
          />
        )}
      </Container>
    );
  }
  return (
    <Container
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      maxWidth={'md' as any /* Overwrite strict type check for "Breakpoint" */}
      className='developer-product-details-page-container'>
      {thumbnailHolder}
      <Grid className='title-and-details-container' direction='column'>
        <DeveloperProductTitle developerProductDetailsData={productDetails} translate={translate} />
        {gameDetails && (
          <DeveloperProductMetadata
            translate={translate}
            developerProductDetailsData={productDetails}
            gameDetails={gameDetails}
            compact={false}
          />
        )}
      </Grid>
    </Container>
  );
};

export default withTranslations(DeveloperProductDetailsPage, developerProductsTranslationConfig);
