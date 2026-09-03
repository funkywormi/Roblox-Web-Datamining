import React, { useState, Fragment } from 'react';
import { createSystemFeedback } from 'react-style-guide';
import ShoppingCartModal from './ShoppingCartModal';
import { setSystemFeedbackService } from '../utils/actionReducer';
import useShoppingCart from '../hooks/useShoppingCart';
import {
  trackShoppingCartOpenClick,
  trackShoppingCartCloseClick,
  TCartCloseReason
} from '../../analytics/axTrackingEvents';
import '../../../../css/shoppingCart/shoppingCartButton.scss';

function ShoppingCartIcon({ totalCartItems, isCartOpen }) {
  return (
    <div className='shopping-cart-icon-container'>
      <div className={`${isCartOpen ? 'cart-open' : ''} shopping-cart-icon`} />
      <span className='cart-number-container'>
        <span className='cart-number'>{totalCartItems || 0}</span>
      </span>
    </div>
  );
}
const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

function ShoppingCartButton(): JSX.Element {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useShoppingCart();
  setSystemFeedbackService(systemFeedbackService);
  const { items } = cart;

  return (
    <Fragment>
      <SystemFeedback />
      <div className='shopping-cart-btn-container'>
        <button
          className='shopping-cart-btn'
          onClick={() => {
            if (isCartOpen) {
              trackShoppingCartCloseClick(TCartCloseReason.ToggleButton);
            } else {
              trackShoppingCartOpenClick();
            }
            setIsCartOpen(!isCartOpen);
          }}
          type='button'>
          <ShoppingCartIcon totalCartItems={items?.length} isCartOpen={isCartOpen} />
        </button>
        {!!isCartOpen && (
          <ShoppingCartModal
            setIsCartOpen={setIsCartOpen}
            systemFeedbackService={systemFeedbackService}
          />
        )}
      </div>
    </Fragment>
  );
}

ShoppingCartButton.propTypes = {};

export default ShoppingCartButton;
