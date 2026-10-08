import React from 'react';

export type GamepassItemPurchaseWrapperProps = {
  ItemPurchase: React.FC<any>;
  itemPurchaseService: { start: () => void };
} & Record<string, any>;

// This wrapper only starts the purchase flow; it does not translate anything itself. The wrapped
// `ItemPurchase` subtree self-sources its own translations (dual-path SelfProvidedTranslate), so
// no translation HOC/provider is needed here.
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

export default GamepassItemPurchaseWrapper;
