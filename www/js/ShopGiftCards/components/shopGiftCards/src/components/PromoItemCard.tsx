import { useMemo } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { Typography, Card } from "@rbx/ui";
import { translationKeys } from "../constants/shopGiftcardsConstants";
import useThumbnails from "../hooks/useThumbnails";
import ITEM_IDS from "../constants/giftcardItemIds";

const PromoItemCard: React.FC<WithTranslationsProps> = ({ translate }): JSX.Element | null => {
  const itemIds = useMemo(() => [ITEM_IDS.CASHSTAR_ITEM, ITEM_IDS.CASHSTAR_BONUS], []);
  const { thumbnails, loading } = useThumbnails(itemIds);

  // Hide card until thumbnails are loaded for better UX
  if (loading) {
    return null;
  }

  return (
    <div className="hero-card promo-item-card">
      <Card className="flex-column" variant="filled">
        <div className="hero-card-details">
          <Typography className="text-card-title" variant="h1">
            {translate(translationKeys.hero.promoTitle)}
          </Typography>
        </div>

        <div className="hero-card-image-container flex-row">
          <div className="hero-card-image flex-row">
            {thumbnails[ITEM_IDS.CASHSTAR_ITEM] && (
              <img src={thumbnails[ITEM_IDS.CASHSTAR_ITEM]} alt="Virtual Item" />
            )}
          </div>
          <div className="hero-card-image flex-row">
            {thumbnails[ITEM_IDS.CASHSTAR_BONUS] && (
              <img src={thumbnails[ITEM_IDS.CASHSTAR_BONUS]} alt="Bonus Virtual Item" />
            )}
          </div>
        </div>

        <div className="hero-card-details">
          <Typography className="text-card-body" variant="caption">
            {translate(translationKeys.hero.promoSubtitle)}
          </Typography>
        </div>
      </Card>
    </div>
  );
};

export default PromoItemCard;
