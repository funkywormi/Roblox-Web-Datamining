import { useCallback, useContext, useMemo } from "react";
import { useFullKeyTranslations } from "@rbx/www-common/i18n";
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
import { EarlyClickScope, isEarlyClickRedirectSection } from "../../modules/earlyClick";

const productTypeToValueMap: Record<string, string> = {
  PRODUCT_TYPE_COLLECTIBLE_ITEM: "PRODUCT_TYPE_COLLECTIBLE_ITEM",
  PRODUCT_TYPE_GAME_PASS_PRODUCT: "PRODUCT_TYPE_GAME_PASS_PRODUCT",
};

type BannerProps = {
  personalizedBonus: SectionPersonalizedBonus;
  showPersonalizedRecommendationsMenu?: boolean;
};

const Banner = ({ personalizedBonus, showPersonalizedRecommendationsMenu }: BannerProps) => {
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

    return (
      <CollectibleItemBonusBanner
        metadata={collectibleItemMetadata}
        showPersonalizedRecommendationsMenu={showPersonalizedRecommendationsMenu}
      />
    );
  } else if (productType === productTypeToValueMap.PRODUCT_TYPE_GAME_PASS_PRODUCT) {
    if (!gamePassMetadata) {
      trackCounter("BonusItemMissingMetadata", { productType });
      return null;
    }

    return (
      <GamePassBonusBanner
        metadata={gamePassMetadata}
        showPersonalizedRecommendationsMenu={showPersonalizedRecommendationsMenu}
      />
    );
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

  const { translateFullKey } = useFullKeyTranslations();

  // Depend on the primitives, not the `redirect` object: useRedirect returns a new object every
  // render, and a new row component type remounts every row (dropping a tap in progress).
  const isRedirectSection = isEarlyClickRedirectSection(personalizedBonus.isRedirect, redirect);
  const redirectUrl = redirect?.url ?? "";

  const clickHandler = useCallback(
    (product: Product, event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      purchaseProduct({
        product,
        event,
        isRedirect: isRedirectSection,
        isSubscription: false,
        isBonus: true,
        sectionType: BuyRobuxPageSectionType.PersonalizedBonus,
      });
    },
    [purchaseProduct, isRedirectSection],
  );

  const ProductItemComponent = useMemo(
    () => (isRedirectSection ? withRedirectProductItem(redirectUrl) : ProductItemDefault),
    [isRedirectSection, redirectUrl],
  );

  return (
    <Section {...getSectionTrackingProps(sectionBase)}>
      <div>
        <SectionHeader>{translateFullKey(sectionBase.sectionHeaderTranslationKey)}</SectionHeader>
        {personalizedBonus.bodyTranslationKey && (
          <SectionSubHeader>
            {translateFullKey(personalizedBonus.bodyTranslationKey)}
          </SectionSubHeader>
        )}
      </div>
      <SectionBody
        isPrimary={isPrimary}
        banner={
          <Banner
            personalizedBonus={personalizedBonus}
            showPersonalizedRecommendationsMenu={sectionBase.showPersonalizedRecommendationsMenu}
          />
        }
      >
        <EarlyClickScope scope="personalizedBonus">
          <SectionBodyProductList
            onProductClick={clickHandler}
            products={sectionBase.products ?? []}
            OverrideProductItemComponent={ProductItemComponent}
          />
        </EarlyClickScope>
      </SectionBody>
    </Section>
  );
}
