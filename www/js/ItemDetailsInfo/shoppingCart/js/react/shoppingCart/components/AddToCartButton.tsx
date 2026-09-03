import React, { useMemo } from 'react';
import { TDiscountInformation } from 'Roblox';
import useShoppingCart from '../hooks/useShoppingCart';
import { catalogTranslations } from '../services/translationService';
import { TTimedOption } from '../constants/types';
import { processTimedOptionsForCart } from '../utils/cartUtils';
import {
  trackShoppingCartAddClick,
  trackShoppingCartRemoveClick,
  TCartActionSource
} from '../../analytics/axTrackingEvents';

type TAddToCartButtonProps = {
  itemId: number;
  itemType: string;
  collectibleItemId?: string | null;
  itemName: string;
  buttonClass?: string;
  timedOptions?: TTimedOption[];
  itemPrice?: number;
  permanentPriceDiscountInformation?: TDiscountInformation;
};

// Helper to get the selected timed option days from an array of timed options
function getSelectedTimedOptionDays(options?: TTimedOption[]): number | null {
  if (!options || options.length === 0) return null;
  const selectedOption = options.find(opt => opt.selected);
  return selectedOption ? selectedOption.days : null;
}

const AddToCartButton = ({
  permanentPriceDiscountInformation,
  itemId,
  itemType,
  collectibleItemId,
  itemName,
  buttonClass,
  timedOptions,
  itemPrice
}: TAddToCartButtonProps): JSX.Element => {
  const { isItemInCart, addItemToCart, removeItemFromCart, cart, dispatch } = useShoppingCart();
  let isInCart = isItemInCart(itemId);

  // Process timed options to ensure permanent option is included
  const processedTimedOptions = processTimedOptionsForCart(
    timedOptions,
    itemPrice || 0,
    permanentPriceDiscountInformation
  );

  // Get the cart item if it exists
  const cartItem = useMemo(() => {
    return cart.items.find(item => item.itemId === itemId);
  }, [cart.items, itemId]);

  // Check if the selected timed option differs from what's in the cart
  const selectedDays = getSelectedTimedOptionDays(processedTimedOptions);
  const cartItemSelectedDays = getSelectedTimedOptionDays(cartItem?.timedOptions);

  // Determine if we should show "Update in Cart" instead of "Remove from Cart"
  const shouldUpdateCart =
    isInCart && selectedDays !== null && selectedDays !== cartItemSelectedDays;

  const getShoppingCartButtonClasses = () => {
    const btnClass = buttonClass !== undefined ? buttonClass : '';
    return `${btnClass} ${!isInCart ? 'btn-primary-lg' : 'btn-secondary-lg'}`;
  };

  const getButtonLabel = () => {
    if (!isInCart) {
      return catalogTranslations.actionAddToCart();
    }
    if (shouldUpdateCart) {
      return catalogTranslations.actionUpdateInCart();
    }
    return catalogTranslations.actionRemoveFromCart();
  };

  const handleClick = () => {
    if (isInCart) {
      if (shouldUpdateCart && selectedDays !== null) {
        // Update the timed option in cart instead of removing
        dispatch({
          type: 'UPDATE_TIMED_OPTIONS',
          itemId,
          itemType,
          selectedDays
        }).catch(() => {
          // Handle error silently
        });
      } else {
        trackShoppingCartRemoveClick(TCartActionSource.ItemDetailsPage, { itemId, itemType });
        removeItemFromCart(itemId, itemType, true).catch(() => {
          isInCart = true;
        });
      }
    } else {
      trackShoppingCartAddClick(TCartActionSource.ItemDetailsPage, { itemId, itemType });
      addItemToCart(
        {
          itemId,
          itemType,
          collectibleItemId,
          itemName,
          timedOptions: processedTimedOptions
        },
        true
      ).catch(() => {
        isInCart = false;
      });
    }
  };

  return (
    <div className='btn-container shopping-cart-add-remove-btn-container'>
      <button className={getShoppingCartButtonClasses()} type='button' onClick={handleClick}>
        {getButtonLabel()}
      </button>
    </div>
  );
};

AddToCartButton.defaultProps = {
  collectibleItemId: null,
  buttonClass: '',
  timedOptions: undefined,
  itemPrice: 0
};

export default AddToCartButton;
