import { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Product, SectionBase, SectionPersonalizedBonus } from "../../types/buyRobuxPageData";
import {
  BaseSectionProps,
  Section,
  SectionBody,
  SectionHeader,
  SectionSubHeader,
} from "../sections/Section";
import { SectionBodyProductList } from "../sections/SectionBodyProductList";
import { PurchaseContext, BuyRobuxPageSectionType } from "../../contexts/PurchaseContext";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import "../../stylesheets/personalizedBonus.scss";
import { ProductItemDefault } from "../ProductItem/ProductItemDefault";
import { withRedirectProductItem } from "../ProductItem/WithRedirectProductItem";
import { GamePassBonusBanner } from "../bonusBannerVariants/GamePassBonusBanner";
import { CollectibleItemBonusBanner } from "../bonusBannerVariants/CollectibleItemBonusBanner";
import { trackCounter } from "../../observability";
import { getSectionTrackingProps } from "../../hooks/useScrollTracking";

const productTypeToValueMap: Record<string, string> = {
  PRODUCT_TYPE_COLLECTIBLE_ITEM: "PRODUCT_TYPE_COLLECTIBLE_ITEM",
  PRODUCT_TYPE_GAME_PASS_PRODUCT: "PRODUCT_TYPE_GAME_PASS_PRODUCT",
};

type BannerProps = {
  personalizedBonus: SectionPersonalizedBonus;
};

const Banner = ({ personalizedBonus }: BannerProps) => {
  const [bonus] = personalizedBonus.bonuses;
  if (!bonus) {
    return null;
  }

  const { collectibleItemMetadata, gamePassMetadata, virtualPurchasingProductType } = bonus;
  // virtualPurchasingProductType is typed as an int, but is actually a string :)
  // convince TS this is the case
  const productType = virtualPurchasingProductType.toString();

  if (productType === productTypeToValueMap.PRODUCT_TYPE_COLLECTIBLE_ITEM) {
    if (!collectibleItemMetadata) {
      trackCounter("BonusItemMissingMetadata", { productType });
      return null;
    }

    return <CollectibleItemBonusBanner metadata={collectibleItemMetadata} />;
  } else if (productType === productTypeToValueMap.PRODUCT_TYPE_GAME_PASS_PRODUCT) {
    if (!gamePassMetadata) {
      trackCounter("BonusItemMissingMetadata", { productType });
      return null;
    }

    return <GamePassBonusBanner metadata={gamePassMetadata} />;
  }

  trackCounter("BonusItemUnsupportedType", { productType });
  return null;
};

type PersonalizedBonusProps = BaseSectionProps & {
  sectionBase: SectionBase;
  personalizedBonus: SectionPersonalizedBonus;
};

export function PersonalizedBonus({
  isPrimary,
  sectionBase,
  personalizedBonus,
}: PersonalizedBonusProps) {
  const { purchaseProduct } = useContext(PurchaseContext);
  const { redirect } = useContext(BuyRobuxPageContext);

  const { translate } = useTranslation();

  const clickHandler = useCallback(
    (product: Product, event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      purchaseProduct({
        product,
        event,
        isRedirect: Boolean(personalizedBonus.isRedirect && redirect?.url),
        isSubscription: false,
        isBonus: true,
        sectionType: BuyRobuxPageSectionType.PersonalizedBonus,
      });
    },
    [purchaseProduct, personalizedBonus.isRedirect, redirect],
  );

  const ProductItemComponent = useMemo(
    () =>
      personalizedBonus.isRedirect && redirect?.url
        ? withRedirectProductItem(redirect.url)
        : ProductItemDefault,
    [personalizedBonus.isRedirect, redirect?.url],
  );

  return (
    <Section {...getSectionTrackingProps(sectionBase)}>
      <div>
        <SectionHeader>{translate(sectionBase.sectionHeaderTranslationKey)}</SectionHeader>
        {personalizedBonus.bodyTranslationKey && (
          <SectionSubHeader>{translate(personalizedBonus.bodyTranslationKey)}</SectionSubHeader>
        )}
      </div>
      <SectionBody isPrimary={isPrimary} banner={<Banner personalizedBonus={personalizedBonus} />}>
        <SectionBodyProductList
          onProductClick={clickHandler}
          products={sectionBase.products ?? []}
          OverrideProductItemComponent={ProductItemComponent}
        />
      </SectionBody>
    </Section>
  );
}
