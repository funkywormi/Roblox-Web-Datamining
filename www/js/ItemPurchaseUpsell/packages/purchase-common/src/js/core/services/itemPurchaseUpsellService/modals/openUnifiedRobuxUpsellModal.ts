import { RobloxIntlInstance } from '@rbx/legacy-webapp-types/Roblox';
import React from 'react';
import ReactDOM from 'react-dom';
import { withTranslations } from '@rbx/core-scripts/react';
import UnifiedRobuxUpsellModal, {
  UnifiedRobuxUpsellModalProps
} from '../../../../../ts/react/components/UnifiedRobuxUpsellModal';
import UnifiedRobuxUpsellTooExpensiveModal, {
  UnifiedRobuxUpsellTooExpensiveModalProps
} from '../../../../../ts/react/components/UnifiedRobuxUpsellTooExpensiveModal';
import translationConfig from '../../../../react/itemPurchase/translation.config';
import { UpsellProduct } from '../constants/serviceTypeDefinitions';
import type { DiscountInformation } from '../../../../../ts/react/components/discountInformation';

export type UnifiedRobuxUpsellVariant = 'standard' | 'tooExpensive';

export type UnifiedRobuxUpsellOfferActionParams = {
  purchasePrice: number;
  offerIds: string[];
};

type BaseProps = {
  onAccept?: () => void | boolean;
  onCancel?: () => void | boolean;
  expectedPrice: number;
  thumbnail: React.ReactNode;
  assetName: string;
  currentRobuxBalance?: number;
};

export type OpenUnifiedRobuxUpsellProps =
  | ({
      variant?: 'standard';
      assetType: string;
      assetTypeDisplayName?: string;
      upsellProduct: UpsellProduct;
      intl: RobloxIntlInstance;
      priceSuffix?: string;
      title?: string;
      discountInformation?: DiscountInformation | null;
      collectibleItemId?: string | null;
      rentalOptionDays?: number | null;
      isLimited?: boolean;
      onRefetchPackage?: (discountedPrice: number) => void;
      onAcceptOffers?: (params: UnifiedRobuxUpsellOfferActionParams) => void | boolean;
      onDirectPurchase?: (params: UnifiedRobuxUpsellOfferActionParams) => void;
    } & BaseProps)
  | ({
      variant: 'tooExpensive';
    } & BaseProps);

export type UnifiedRobuxUpsellModalHandle = {
  close: () => void;
  /** Swap the recommended Robux package and/or toggle the package loading state. */
  updatePackage: (product?: UpsellProduct, loading?: boolean) => void;
  setPackageLoading: (loading: boolean) => void;
};

export function openUnifiedRobuxUpsellModal(
  props: OpenUnifiedRobuxUpsellProps
): UnifiedRobuxUpsellModalHandle {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const unmount = () => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  };

  const close = () => {
    unmount();
    props.onCancel?.();
  };

  const handleAccept = () => {
    const result = props.onAccept?.();
    if (result !== false) {
      close();
    }
  };

  if (props.variant === 'tooExpensive') {
    const TranslatedTooExpensiveModal = withTranslations(
      UnifiedRobuxUpsellTooExpensiveModal,
      translationConfig.purchasingResources
    );

    const element = React.createElement(TranslatedTooExpensiveModal, {
      expectedPrice: props.expectedPrice,
      thumbnail: props.thumbnail,
      assetName: props.assetName,
      onAction: handleAccept,
      onCancel: close,
      open: true,
      loading: false,
      currentRobuxBalance: props.currentRobuxBalance
    } as UnifiedRobuxUpsellTooExpensiveModalProps);

    ReactDOM.render(element, container);
    return { close, updatePackage: () => undefined, setPackageLoading: () => undefined };
  }

  // Default: standard variant
  const standardProps = props;
  const TranslatedStandardModal = withTranslations(
    UnifiedRobuxUpsellModal,
    translationConfig.purchasingResources
  );

  // Mutable rendering state so the recommended package can be swapped in place
  // (re-rendering the same component preserves the offers hook state) when an
  // offer toggle re-fetches against the discounted shortfall.
  let currentProduct: UpsellProduct | undefined = standardProps.upsellProduct;
  let packageLoading = false;

  const handleAcceptOffers = standardProps.onAcceptOffers
    ? (params: UnifiedRobuxUpsellOfferActionParams) => {
        const result = standardProps.onAcceptOffers?.(params);
        if (result !== false) {
          close();
        }
      }
    : undefined;

  const handleDirectPurchase = standardProps.onDirectPurchase
    ? (params: UnifiedRobuxUpsellOfferActionParams) => {
        standardProps.onDirectPurchase?.(params);
        // A direct purchase is a success path, not a dismissal — tear down the
        // modal without firing onCancel (which logs the UpsellCancelled counter).
        unmount();
      }
    : undefined;

  const renderStandard = () => {
    const element = React.createElement(TranslatedStandardModal, {
      expectedPrice: standardProps.expectedPrice,
      thumbnail: standardProps.thumbnail,
      assetName: standardProps.assetName,
      assetType: standardProps.assetType,
      assetTypeDisplayName: standardProps.assetTypeDisplayName,
      onAction: handleAccept,
      onCancel: close,
      open: true,
      loading: false,
      currentRobuxBalance: standardProps.currentRobuxBalance,
      robuxPackageAmount: currentProduct?.robux_amount,
      robuxPackagePrice: currentProduct?.price,
      packageLoading,
      priceSuffix: standardProps.priceSuffix,
      title: standardProps.title,
      discountInformation: standardProps.discountInformation,
      collectibleItemId: standardProps.collectibleItemId,
      rentalOptionDays: standardProps.rentalOptionDays,
      isLimited: standardProps.isLimited,
      onRefetchPackage: standardProps.onRefetchPackage,
      onAcceptOffers: handleAcceptOffers,
      onDirectPurchase: handleDirectPurchase
    } as UnifiedRobuxUpsellModalProps);

    ReactDOM.render(element, container);
  };

  renderStandard();

  return {
    close,
    updatePackage: (product?: UpsellProduct, loading = false) => {
      if (product) {
        currentProduct = product;
      }
      packageLoading = loading;
      renderStandard();
    },
    setPackageLoading: (loading: boolean) => {
      packageLoading = loading;
      renderStandard();
    }
  };
}

export default openUnifiedRobuxUpsellModal;
