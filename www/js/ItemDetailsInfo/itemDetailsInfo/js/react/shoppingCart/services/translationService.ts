import { RobloxTranslationResource, TranslationResourceProvider } from 'Roblox';
import { numberFormat } from 'core-utilities';
import {
  translationConfig,
  featureItemTranslationConfig,
  itemModelTranslationConfig,
  featureRobloxSubscriptionTranslationConfig
} from '../translation.config';

const resourceProvider = new TranslationResourceProvider();

// TODO: for any translations in Feature.Catalog that should have been used,
//       but weren't because they were Lua only, activate them for web.

export type TTranslationNamespace =
  | 'featureCatalog'
  | 'featureItem'
  | 'featureItemModel'
  | 'featureRobloxSubscription';

export const translationResources: Record<
  TTranslationNamespace,
  () => RobloxTranslationResource
> = {
  featureCatalog: () => resourceProvider.getTranslationResource(translationConfig.feature),
  featureItem: () => resourceProvider.getTranslationResource(featureItemTranslationConfig.feature),
  featureItemModel: () =>
    resourceProvider.getTranslationResource(itemModelTranslationConfig.feature),
  featureRobloxSubscription: () =>
    resourceProvider.getTranslationResource(featureRobloxSubscriptionTranslationConfig.feature)
};

export const catalogTranslations = {
  actionSeeMoreReseller: (): string => {
    return translationResources.featureCatalog().get('Action.SeeMoreReseller', {
      linkStart: '<a href="#resellers" class="text-link">',
      resellerLink: translationResources.featureCatalog().get('Heading.Resellers', {}),
      linkEnd: '</a>'
    });
  },
  actionBuy: (): string => {
    return translationResources.featureCatalog().get('Action.Buy', {});
  },
  actionRent: (): string => {
    return translationResources.featureCatalog().get('Action.Rent', {});
  },
  labelCategoryType: (): string => {
    return translationResources.featureCatalog().get('Label.CategoryType', {});
  },
  labelTags: (): string => {
    return translationResources.featureCatalog().get('Label.Tags', {});
  },
  labelSalesType: (): string => {
    return translationResources.featureCatalog().get('Label.Filter.SalesType', {});
  },
  labelCollectibles: (): string => {
    return translationResources.featureCatalog().get('LabelCollectibles', {});
  },
  messageCollectiblesInfo: (): string => {
    return translationResources.featureCatalog().get('Message.CollectiblesInfo', {});
  },
  labelNewCollectibles: (): string => {
    return translationResources.featureCatalog().get('Label.NewCollectibles', {});
  },
  labelByCreatorLink: (params: Record<string, string>): string => {
    return translationResources.featureCatalog().get('Label.ByCreatorLink', params);
  },
  labelTradable: (): string => {
    return translationResources.featureCatalog().get('Label.Tradable', {});
  },
  labelDescription: (): string => {
    return translationResources.featureCatalog().get('Label.Description', {});
  },
  labelNotAvailable: (): string => {
    return translationResources.featureCatalog().get('Label.NotAvailable', {});
  },
  labelNoResellers: (): string => {
    return translationResources.featureCatalog().get('LabelNoResellers', {});
  },
  actionAddToCart: (): string => {
    return translationResources.featureCatalog().get('Action.AddToCart', {});
  },
  actionRemoveFromCart: (): string => {
    return translationResources.featureCatalog().get('Action.RemoveFromCart', {});
  },
  actionUpdateInCart: (): string => {
    return translationResources.featureCatalog().get('Action.UpdateInCart', {});
  },
  headingItemAddedToCart: (params: Record<string, string>): string => {
    return translationResources.featureCatalog().get('Heading.ItemAddedToCart', params);
  },
  headingItemRemovedFromCart: (params: Record<string, string>): string => {
    return translationResources.featureCatalog().get('Heading.ItemRemovedFromCart', params);
  },
  labelTotalUnformatted: (): string => {
    return translationResources.featureCatalog().get('Label.TotalUnformatted', {});
  },
  messageRemainingBalance: (params: Record<string, string>): string => {
    return translationResources.featureCatalog().get('Message.RemainingBalance', params);
  },
  messageInsufficientFundsForTransaction: (): string => {
    return translationResources.featureCatalog().get('Message.InsufficientFundsForTransaction', {});
  },
  labelShoppingCart: (): string => {
    return translationResources.featureCatalog().get('Label.ShoppingCart', {});
  },
  labelTotalItems: (params: Record<string, string>): string => {
    return translationResources.featureCatalog().get('Label.TotalItems', params);
  },
  messagePurchaseLimit: (params: Record<string, string>): string => {
    return translationResources.featureCatalog().get('Message.PurchaseLimit', params);
  },
  actionAddItemsToCart: (items: string): string => {
    return translationResources.featureCatalog().get('Action.AddItemsToCart', { items });
  },
  actionRemoveItemsFromCart: (items: string): string => {
    return translationResources.featureCatalog().get('Action.RemoveItemsFromCart', { items });
  },
  headingItemsRemovedFromCart: (params: Record<string, string>): string => {
    return translationResources.featureCatalog().get('Heading.ItemsRemovedFromCart', params);
  },
  headingItemsAddedToCart: (params: Record<string, string>): string => {
    return translationResources.featureCatalog().get('Heading.ItemsAddedToCart', params);
  },
  labelPermanent: (): string => {
    return translationResources.featureCatalog().get('Label.Permanent', {});
  },
  labelTimedOptionDays: (days: number): string => {
    return translationResources.featureCatalog().get('Label.TimedOptionDays', {
      days: numberFormat.getNumberFormat(days)
    });
  },
  labelPremiumDiscount: (discountPercentage: number): string => {
    return translationResources
      .featureCatalog()
      .get('Label.PremiumDiscount', { discountPercentage: `${discountPercentage}` });
  },
  actionSubscribe: (): string => {
    return translationResources.featureCatalog().get('Action.Subscribe', {});
  },
  labelSave: (): string => {
    return translationResources.featureCatalog().get('Label.Save', {});
  },
  actionLearnMore: (): string => {
    return translationResources.featureCatalog().get('Action.LearnMore', {});
  },
  labelSubtotal: (itemCount: number): string => {
    const itemWord = itemCount === 1 ? 'Item' : 'Items';
    return translationResources
      .featureCatalog()
      .get('Label.Subtotal', { count: `${itemCount}`, itemWord });
  }
};

export const itemTranslations = {
  labelShowLess: (): string => {
    return translationResources.featureItem().get('Label.ShowLess', {});
  },
  labelReadMore: (): string => {
    return translationResources.featureItem().get('Label.ReadMore', {});
  },
  labelFree: (): string => {
    return translationResources.featureItem().get('Label.Free', {});
  },
  actionGetPremium: (): string => {
    return translationResources.featureItem().get('Action.GetPremium', {});
  },
  actionBuy: (): string => {
    return translationResources.featureItem().get('Action.Buy', {});
  },
  labelPremiumDiscountSavings: (discountPercentage: number, originalPrice: number): string => {
    const robuxPrice = `<span class="discount-savings-original-price"><span class="icon-robux-16x16"></span>${numberFormat.getNumberFormat(
      originalPrice
    )}</span>`;
    return translationResources.featureItem().get('Label.PremiumDiscountSavings', {
      discountPercentage: numberFormat.getNumberFormat(discountPercentage),
      originalPrice: robuxPrice
    });
  },
  labelPremiumDiscountOpportunityPrompt: (premiumPrice: number): string => {
    const robuxPrice = `<span class="discount-savings-original-price"><span class="icon-robux-16x16"></span>${numberFormat.getNumberFormat(
      premiumPrice
    )}</span>`;
    return translationResources.featureItem().get('Label.PremiumDiscountOpportunityPrompt', {
      premiumDiscountedPrice: robuxPrice
    });
  },
  labelBestPrice: (): string => {
    return translationResources.featureItem().get('Label.BestPrice', {});
  },
  labelPrice: (): string => {
    return translationResources.featureItem().get('Label.Price', {});
  },
  actionYes: (): string => {
    return translationResources.featureItem().get('Action.Yes', {});
  },
  actionNo: (): string => {
    return translationResources.featureItem().get('Action.No', {});
  },
  actionInventory: (): string => {
    return translationResources.featureItem().get('Action.Inventory', {});
  },
  labelItemNotForSale: (): string => {
    return translationResources.featureItem().get('Label.ItemNotForSale', {});
  }
};

export const itemModelTranslations = {
  labelLimitedQuantity: (
    unitsAvailableForConsumption: number,
    totalQuantity?: number | null
  ): string => {
    const unitsForConsumption = numberFormat.getNumberFormat(unitsAvailableForConsumption);
    const total =
      typeof totalQuantity === 'number' ? numberFormat.getNumberFormat(totalQuantity) : null;
    return translationResources.featureItemModel().get('Label.LimitedQuantity', {
      amount: total ? `${unitsForConsumption}/${total}` : unitsForConsumption
    });
  }
};

export const robloxSubscriptionTranslations = {
  descriptionSavingWithPlus: (params: Record<string, string>): string => {
    return translationResources
      .featureRobloxSubscription()
      .get('Description.SavingWithPlus', params);
  },
  labelBlackbirdUpsellBanner: (params: Record<string, string>): string => {
    return translationResources
      .featureRobloxSubscription()
      .get('Label.BlackbirdUpsellBanner', params);
  },
  actionTrialSubscription: (): string => {
    return translationResources.featureRobloxSubscription().get('Action.TrialSubscription', {});
  },
  actionSubscribe: (): string => {
    return translationResources.featureRobloxSubscription().get('Action.Subscribe', {});
  }
};

export default translationResources;
