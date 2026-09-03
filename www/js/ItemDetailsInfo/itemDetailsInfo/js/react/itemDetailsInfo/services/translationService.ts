import { RobloxTranslationResource, TranslationResourceProvider } from 'Roblox';
import { TranslateFunction } from 'react-utilities';
import { numberFormat } from 'core-utilities';
import {
  translationConfig,
  featureItemTranslationConfig,
  itemModelTranslationConfig
} from '../translation.config';

let resourceProvider = new TranslationResourceProvider();

// TODO: for any translations in Feature.Catalog that should have been used,
//       but weren't because they were Lua only, activate them for web.

export type TTranslationNamespace = 'featureCatalog' | 'featureItem' | 'featureItemModel';

// eslint-disable-next-line import/no-mutable-exports
let translationResources: Record<TTranslationNamespace, RobloxTranslationResource> = {
  featureCatalog: resourceProvider.getTranslationResource(translationConfig.feature),
  featureItem: resourceProvider.getTranslationResource(featureItemTranslationConfig.feature),
  featureItemModel: resourceProvider.getTranslationResource(itemModelTranslationConfig.feature)
};

export const reloadTranslations = function reload(): void {
  resourceProvider = new TranslationResourceProvider();
  translationResources = {
    featureCatalog: resourceProvider.getTranslationResource(translationConfig.feature),
    featureItem: resourceProvider.getTranslationResource(featureItemTranslationConfig.feature),
    featureItemModel: resourceProvider.getTranslationResource(itemModelTranslationConfig.feature)
  };
};

export const translateCatalogGet: TranslateFunction = translationResources.featureCatalog
  .get as TranslateFunction;

export const catalogTranslations = {
  actionSeeMoreReseller: (): string => {
    return translationResources.featureCatalog.get('Action.SeeMoreReseller', {
      linkStart: '<a href="#resellers" class="text-link">',
      resellerLink: translationResources.featureCatalog.get('Heading.Resellers', {}),
      linkEnd: '</a>'
    });
  },
  actionBuy: (): string => {
    return translationResources.featureCatalog.get('Action.Buy', {});
  },
  actionRent: (): string => {
    return translationResources.featureCatalog.get('Action.Rent', {});
  },
  actionUnlock: (): string => {
    return translationResources.featureCatalog.get('Action.Unlock', {});
  },
  labelCategoryType: (): string => {
    return translationResources.featureCatalog.get('Label.CategoryType', {});
  },
  labelTags: (): string => {
    return translationResources.featureCatalog.get('Label.Tags', {});
  },
  labelSalesType: (): string => {
    return translationResources.featureCatalog.get('Label.Filter.SalesType', {});
  },
  labelCollectibles: (): string => {
    return translationResources.featureCatalog.get('LabelCollectibles', {});
  },
  messageCollectiblesInfo: (): string => {
    return translationResources.featureCatalog.get('Message.CollectiblesInfo', {});
  },
  labelResellable: (): string => {
    return translationResources.featureCatalog.get('Label.Resellable', {});
  },
  messageCannotResell: (): string => {
    return translationResources.featureCatalog.get('Message.CannotResell', {});
  },
  messageSoldOut: (): string => {
    return translationResources.featureCatalog.get('Message.SoldOut', {});
  },
  labelNewCollectibles: (): string => {
    return translationResources.featureCatalog.get('Label.NewCollectibles', {});
  },
  labelByCreatorLink: (params: Record<string, string>): string => {
    return translationResources.featureCatalog.get('Label.ByCreatorLink', params);
  },
  labelTradable: (): string => {
    return translationResources.featureCatalog.get('Label.Tradable', {});
  },
  labelInExperienceOnly: (): string => {
    return translationResources.featureCatalog.get('Label.InExperienceOnly', {});
  },
  labelQuantityLimitReached: (): string => {
    return translationResources.featureCatalog.get('Label.QuantityLimitReached', {});
  },
  labelDescription: (): string => {
    return translationResources.featureCatalog.get('Label.Description', {});
  },
  actionAddToCart: (): string => {
    return translationResources.featureCatalog.get('Action.AddToCart', {});
  },
  actionRemoveFromCart: (): string => {
    return translationResources.featureCatalog.get('Action.RemoveFromCart', {});
  },
  actionUpdateInCart: (): string => {
    return translationResources.featureCatalog.get('Action.UpdateInCart', {});
  },
  labelOriginalPrice: (): string => {
    return translationResources.featureCatalog.get('Label.OriginalPrice', {});
  },
  labelOriginalUnavailable: (): string => {
    return translationResources.featureCatalog.get('Label.OriginalUnavailable', {});
  },
  labelHoldingPeriod: (): string => {
    return translationResources.featureCatalog.get('Label.HoldingPeriod', {});
  },
  labelSoldIn: (): string => {
    return translationResources.featureCatalog.get('Label.SoldIn', {});
  },
  headingHoldingPolicy: (): string => {
    return translationResources.featureCatalog.get('Heading.HoldingPolicy', {});
  },
  messageHoldingPolicyL1: (resaleDays: number): string => {
    return translationResources.featureCatalog.get('Message.HoldingPolicyL1', {
      days: numberFormat.getNumberFormat(resaleDays)
    });
  },
  messageHoldingPolicyL2: (purchaseDays: number, resaleDays: number): string => {
    return translationResources.featureCatalog.get('Message.HoldingPolicyL2', {
      purchaseDays: numberFormat.getNumberFormat(purchaseDays),
      resaleDays: numberFormat.getNumberFormat(resaleDays)
    });
  },
  messageNoHoldingPolicy: (): string => {
    return translationResources.featureCatalog.get('Message.NoHoldingPolicy', {});
  },
  labelCreated: (): string => {
    return translationResources.featureCatalog.get('Label.Created', {});
  },
  labelYes: (): string => {
    return translationResources.featureCatalog.get('Label.Yes', {});
  },
  labelAttributes: (): string => {
    return translationResources.featureCatalog.get('Label.Attributes', {});
  },
  labelAdvancedMaterials: (): string => {
    return translationResources.featureCatalog.get('Label.AdvancedMaterials', {});
  },
  // Label.PBRInfo predates the AdvancedMaterials rename and still holds its copy.
  labelPBRInfo: (): string => {
    return translationResources.featureCatalog.get('Label.PBRInfo', {});
  },
  labelEmissive: (): string => {
    return translationResources.featureCatalog.get('Label.Emissive', {});
  },
  labelEmissiveInfo: (): string => {
    return translationResources.featureCatalog.get('Label.EmissiveInfo', {});
  },
  labelHeadShape: (): string => {
    return translationResources.featureCatalog.get('Label.HeadShape', {});
  },
  labelAdjustable: (): string => {
    return translationResources.featureCatalog.get('Label.Adjustable', {});
  },
  labelPermanent: (): string => {
    return translationResources.featureCatalog.get('Label.Permanent', {});
  },
  labelTimedOptionDays: (days: number): string => {
    return translationResources.featureCatalog.get('Label.TimedOptionDays', {
      days: numberFormat.getNumberFormat(days)
    });
  },
  messageTimedOptionsInYourInventoryUntil: (date: string): string => {
    return translationResources.featureCatalog.get('Message.TimedOptionsInYourInventoryUntil', {
      date
    });
  },
  labelTimedOptionsTooltipTitle: (): string => {
    return translationResources.featureCatalog.get('Label.TimedOptionsTooltipTitle', {});
  },
  labelTimedOptionsTooltipBody: (): string => {
    return translationResources.featureCatalog.get('Label.TimedOptionsTooltipBody', {});
  },
  labelOptions: (): string => {
    return translationResources.featureCatalog.get('Label.Options', {});
  },
  labelRentOption: (): string => {
    return translationResources.featureCatalog.get('Label.RentOption', {});
  },
  labelTimedOptionDaysAbbreviation: (days: number): string => {
    return translationResources.featureCatalog.get('Label.TimedOptionDaysAbbreviation', {
      days: numberFormat.getNumberFormat(days)
    });
  },
  labelPlacement: (): string => {
    return translationResources.featureCatalog.get('Label.Placement', {});
  },
  messagePriceCouldBeDifferent: (): string => {
    return translationResources.featureCatalog.get('Message.PriceCouldBeDifferent', {});
  },
  messageAgeCheckCompleteInventory: (itemName: string): string => {
    return translationResources.featureCatalog.get('Message.AgeCheckCompleteInventory', {
      itemName
    });
  },
  // TODO: replace href='#' with the real Terms URL once available.
  labelFreeItemWithAnAgeCheck: (): string => {
    return translationResources.featureCatalog.get('Label.FreeItemWithAnAgeCheck', {
      linkStart: '<a href="#" class="text-link">',
      linkEnd: '</a>'
    });
  },
  labelAgeCheckComplete: (): string => {
    return translationResources.featureCatalog.get('Label.AgeCheckComplete', {});
  },
  labelAttribution: (): string => {
    return translationResources.featureCatalog.get('Label.Attribution', {});
  }
};

export const itemTranslations = {
  labelShowLess: (): string => {
    return translationResources.featureItem.get('Label.ShowLess', {});
  },
  labelReadMore: (): string => {
    return translationResources.featureItem.get('Label.ReadMore', {});
  },
  labelFree: (): string => {
    return translationResources.featureItem.get('Label.Free', {});
  },
  actionGetPremium: (): string => {
    return translationResources.featureItem.get('Action.GetPremium', {});
  },
  actionBuy: (): string => {
    return translationResources.featureItem.get('Action.Buy', {});
  },
  labelPremiumDiscountSavings: (discountPercentage: number, originalPrice: number): string => {
    const robuxPrice = `<span class="discount-savings-original-price"><span class="icon-robux-16x16"></span>${numberFormat.getNumberFormat(
      originalPrice
    )}</span>`;
    return translationResources.featureItem.get('Label.PremiumDiscountSavings', {
      discountPercentage: numberFormat.getNumberFormat(discountPercentage),
      originalPrice: robuxPrice
    });
  },
  labelPremiumDiscountOpportunityPrompt: (premiumPrice: number): string => {
    const robuxPrice = `<span class="discount-savings-original-price"><span class="icon-robux-16x16"></span>${numberFormat.getNumberFormat(
      premiumPrice
    )}</span>`;
    return translationResources.featureItem.get('Label.PremiumDiscountOpportunityPrompt', {
      premiumDiscountedPrice: robuxPrice
    });
  },
  labelBestPrice: (): string => {
    return translationResources.featureItem.get('Label.BestPrice', {});
  },
  labelPrice: (): string => {
    return translationResources.featureItem.get('Label.Price', {});
  },
  actionYes: (): string => {
    return translationResources.featureItem.get('Action.Yes', {});
  },
  actionNo: (): string => {
    return translationResources.featureItem.get('Action.No', {});
  },
  actionInventory: (): string => {
    return translationResources.featureItem.get('Action.Inventory', {});
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
    return translationResources.featureItemModel.get('Label.LimitedQuantity', {
      amount: total ? `${unitsForConsumption}/${total}` : unitsForConsumption
    });
  },
  labelQuantityMaxPerUser: (amount: number): string => {
    return translationResources.featureItemModel.get('Label.MaxCopiesPerUser', {
      amount: `${amount}`
    });
  },
  labelResellers: (): string => {
    return translationResources.featureItemModel.get('Label.Resellers', {});
  }
};

export default translationResources;
