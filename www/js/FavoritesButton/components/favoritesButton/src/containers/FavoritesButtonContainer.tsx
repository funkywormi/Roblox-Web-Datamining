import React, { useState, useEffect } from 'react';
import { eventStreamService } from '@rbx/core-scripts/legacy/core-roblox-utilities';
import { httpResponseCodes } from '@rbx/core-scripts/legacy/core-utilities';
import { TranslateFunction } from '@rbx/core-scripts/legacy/react-utilities';
import { createSystemFeedback } from '@rbx/core-ui/legacy/react-style-guide';
import { authenticatedUser } from '@rbx/core-scripts/legacy/header-scripts';
import FavoritesButton from '../components/FavoritesButton';
import FavoritesButtonService from '../services/FavoritesButtonService';
import FavoritesLoggedInModal from '../components/FavoritesLoggedInModal';
import eventStreamConstants, { eventType } from '../constants/eventStreamConstants';

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

export const FavoritesButtonContainer = ({
  assetId,
  itemType,
  translate
}: {
  assetId: number | string;
  itemType: string;
  translate: TranslateFunction;
}): JSX.Element => {
  let isSendingFavoritesCall: boolean;
  const [showFavoriteCount, setShowFavoriteCount] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [showLogInModal, setShowLogInModal] = useState<boolean>(false);
  const [isCountLoaded, setIsCountLoaded] = useState<boolean>(false);
  const [favoriteCount, setFavoriteCount] = useState<number | undefined>(undefined);

  const getCurrentFavoriteCount = async () => {
    try {
      const result = await FavoritesButtonService.getCurrentFavoriteCount(assetId, itemType);

      // Hard coded logic for favorites count being 0 because the favorites count api call lags a bit in response time
      if (result <= 0 && isFavorited) {
        setFavoriteCount(1);
      } else {
        setFavoriteCount(result);
      }
      setIsCountLoaded(true);
    } catch {
      setFavoriteCount(undefined);
      setIsCountLoaded(true);
    }
  };

  const getShowFavoriteCount = () => {
    FavoritesButtonService.getShowFavoriteCount()
      .then(result => {
        setShowFavoriteCount(result.EnableAggregateLikesFavoritesCount);
      })
      .catch(() => {
        setShowFavoriteCount(false);
      });
  };

  const getCurrentFavoriteStatus = async () => {
    const result = await FavoritesButtonService.getCurrentFavoriteStatus(assetId, itemType);
    setIsFavorited(result);

    if (!isCountLoaded) {
       
      getCurrentFavoriteCount().catch(() => {
        setFavoriteCount(undefined);
      });
    }
  };

  const postFavorite = async () => {
    isSendingFavoritesCall = true;
    setIsFavorited(true);
    const status = await FavoritesButtonService.postFavorite(assetId, itemType);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    handleFavoriteResponse(status, true);
    isSendingFavoritesCall = false;
  };

  const deleteFavorite = async () => {
    isSendingFavoritesCall = true;
    setIsFavorited(false);
    const status = await FavoritesButtonService.deleteFavorite(assetId, itemType);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    handleFavoriteResponse(status, false);
    isSendingFavoritesCall = false;
  };

   
  const handleFavoriteResponse = (status: number, isFavorited: boolean) => {
    if (status !== null) {
      switch (status) {
        case httpResponseCodes.ok: {
          setIsFavorited(isFavorited);
          if (!isFavorited) {
            if (favoriteCount! > 0) {
              setFavoriteCount(favoriteCount! - 1);
            }
          } else {
            setFavoriteCount(favoriteCount! + 1);
          }
          break;
        }
        case httpResponseCodes.unauthorized: {
          systemFeedbackService.warning(translate('DescriptionLoginRequired'));
          break;
        }
        case httpResponseCodes.forbidden: {
          systemFeedbackService.warning(translate('DescriptionLoginRequired'));
          break;
        }
        case httpResponseCodes.conflict: {
          setIsFavorited(isFavorited);
          break;
        }
        default: {
          systemFeedbackService.warning(translate('MessageAssetNotFoundError'));
          break;
        }
      }
    }
  };

  const onFavoriteChange = () => {
    if (!authenticatedUser.isAuthenticated) {
      setShowLogInModal(true);
      return;
    }

    if (isSendingFavoritesCall) {
      return;
    }
    if (isFavorited) {
      // eslint-disable-next-line no-void
      void deleteFavorite();
    } else {
      // eslint-disable-next-line no-void
      void postFavorite();
    }

    const tryOnParams = eventStreamConstants.favoriteButtonClicked(
      {
        url: window.location.href
      },
      itemType
    );
    eventStreamService.sendEvent(...tryOnParams);
  };

  const onModalClose = () => {
    setShowLogInModal(false);
  };

  useEffect(() => {
    getShowFavoriteCount();
    if (authenticatedUser.isAuthenticated) {
       
      getCurrentFavoriteStatus().catch(() => {
        setIsFavorited(false);
      });
    } else {
      getCurrentFavoriteCount().catch(() => {
        setFavoriteCount(undefined);
      });
    }
  }, []);

  return (
    <div className='favorites-button-container'>
      <SystemFeedback />
      <FavoritesLoggedInModal
        translate={translate}
        showModal={showLogInModal}
        onModalClose={onModalClose}
      />
      <FavoritesButton
        translate={translate}
        showFavoriteCount={showFavoriteCount}
        isFavorited={isFavorited}
        favoriteCount={favoriteCount}
        onFavoriteChange={onFavoriteChange}
      />
    </div>
  );
};

export default FavoritesButtonContainer;
