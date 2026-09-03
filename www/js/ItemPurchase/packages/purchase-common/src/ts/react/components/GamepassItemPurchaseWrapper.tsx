import React from 'react';
import { withTranslations } from '@rbx/core-scripts/react';
import itemPurchaseTranslationConfig from '../../../js/react/itemPurchase/translation.config';

export type GamepassItemPurchaseWrapperProps = {
  ItemPurchase: React.FC<any>;
  itemPurchaseService: { start: () => void };
} & Record<string, any>;

const GamepassItemPurchaseWrapper: React.FC<GamepassItemPurchaseWrapperProps> = ({
  ItemPurchase,
  itemPurchaseService,
  innerProps
}) => {
  React.useEffect(() => {
    // Add a small delay to ensure the component is mounted before starting the purchase flow.
    // This is needed to support game pass purchase not being pre-mounted.
    setTimeout(() => itemPurchaseService.start(), 70);
  }, [itemPurchaseService]);

  return <ItemPurchase {...innerProps} />;
};

export default withTranslations(
  GamepassItemPurchaseWrapper,
  itemPurchaseTranslationConfig.purchasingResources
);
