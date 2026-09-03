import React, { Fragment, useMemo } from "react";
import { SimpleModal } from "react-style-guide";
import { TranslateFunction } from "react-utilities";
import { Thumbnail } from "@rbx/payments/thumbnails";
import { PriceTag } from "@rbx/payments/priceTag";
import { avatarPageUrl, buyRobuxPageUrl, eventTypes } from "../constants/redeemGiftCardConstants";
import sendRedeemGiftCardEvent from "../utils/events";
import robuxTreasureChest from "../images/robux_treasure_chest.png";
import GeneralModalMessage from "./generalModalMessage";

type Props = {
  grantedRobux: string | number | undefined;
  itemName?: string;
  itemId?: number;
  itemType?: string;
  redeemedItem: boolean;
  redeemedRobux: boolean;
  redeemedCredit: number;
  currencyCode: string | null;
  showModal: boolean;
  handleCloseModal: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  showTwentyPercentMoreRobux: boolean;
  translate: TranslateFunction;
};

function ConfirmationModal({
  grantedRobux,
  itemName,
  itemId,
  itemType,
  redeemedItem,
  redeemedRobux,
  redeemedCredit,
  currencyCode,
  showModal,
  handleCloseModal,
  showTwentyPercentMoreRobux,
  translate,
}: Props) {
  const grantedCreditMessage = redeemedCredit > 0 && translate("Label.RedeemCreditSuccess");
  const grantedRobuxMessageEnd = grantedRobux && translate("Description.RobuxAddedEnd");
  const grantedItemMessage = itemName && translate("Description.ItemAdded", { itemName });
  const twentyPercentMoreRobuxText =
    translate("Description.ConvertRobloxCreditGet20PercentMoreRobux") ||
    translate("Description.ConvertRobloxCreditGetUpTo20PercentMoreRobux");
  const twentyPercentMoreRobuxSubtext = translate("Label.OfferAvailableOnDesktopWeb");
  const upsellImageAltText =
    translate("Description.RobuxTreasureChestImageAlt") || "Robux treasure chest";
  const successHeader = translate("Response.CodeSuccess");
  const getRobuxText = translate("Action.GetRobux");
  const equipAvatar = translate("Action.EquipAvatar");
  const backToRedeem = translate("Action.BackToRedeem");
  const closeText = translate("Action.Dialog.Close");

  const thumbnailType = useMemo(() => {
    if (itemType === "Bundle") {
      return "BundleThumbnail";
    }
    return "Asset";
  }, [itemType]);

  const onEquip = (e: React.MouseEvent<HTMLButtonElement>) => {
    sendRedeemGiftCardEvent(eventTypes.equipAvatarClicked);
    handleCloseModal(e);
    window.location.href = avatarPageUrl;
  };

  const onGetRobux = (e: React.MouseEvent<HTMLButtonElement>) => {
    sendRedeemGiftCardEvent(eventTypes.getRobuxClicked);
    handleCloseModal(e);
    window.location.href = buyRobuxPageUrl;
  };

  const onRedeemAgain = (e?: React.MouseEvent<HTMLButtonElement>) => {
    sendRedeemGiftCardEvent(eventTypes.redeemAgainClicked);
    handleCloseModal(e);
  };

  const onClose = (e?: React.MouseEvent<HTMLButtonElement>) => {
    handleCloseModal(e);
  };

  return (
    // SimpleModal's declared type may not reflect all forwarded props (e.g. id); pass through as-is
    <SimpleModal
      {...({ id: "confirmation-modal" } as object)}
      show={showModal}
      title={successHeader}
      body={
        <Fragment>
          {redeemedCredit > 0 && (
            <Fragment>
              <span className="body-text text-description">
                <PriceTag
                  amount={redeemedCredit}
                  currencyCode={currencyCode!}
                  tagClassName="text-emphasis modal-text-bold"
                />{" "}
                {grantedCreditMessage}
              </span>
              <br />
            </Fragment>
          )}
          {redeemedRobux && (
            <Fragment>
              <span className="body-text text-description">
                <span className="icon-robux-16x16 robux-mobile-icon" />{" "}
                <span className="text-emphasis modal-text-bold">{grantedRobux}</span>{" "}
                {grantedRobuxMessageEnd}
              </span>
              <br />
            </Fragment>
          )}
          {showTwentyPercentMoreRobux && !redeemedItem && redeemedCredit ? (
            <GeneralModalMessage
              imagePath={robuxTreasureChest}
              modalMessageText={twentyPercentMoreRobuxText}
              modalMessageSubtext={twentyPercentMoreRobuxSubtext}
              imageAlt={upsellImageAltText}
            />
          ) : null}
          {redeemedItem && (
            <Fragment>
              <span className="body-text text-description">{grantedItemMessage}</span>
              {showTwentyPercentMoreRobux && redeemedCredit ? (
                <span className="twenty-percent-more-modal-with-item-text">
                  {twentyPercentMoreRobuxText}
                </span>
              ) : null}
            </Fragment>
          )}
        </Fragment>
      }
      thumbnail={
        itemId !== undefined &&
        itemId > 0 && (
          <Thumbnail type={thumbnailType} targetId={itemId} altName="redeemed-item-thumbnail" />
        )
      }
      actionButtonText={redeemedItem ? equipAvatar : getRobuxText}
      neutralButtonText={showTwentyPercentMoreRobux && redeemedCredit ? closeText : backToRedeem}
      actionButtonShow={showTwentyPercentMoreRobux && redeemedCredit ? true : redeemedItem}
      // SimpleModal's callback types may not reflect actual event args passed at runtime
      onAction={(redeemedItem ? onEquip : onGetRobux) as () => void}
      onClose={onClose as () => void}
      onNeutral={onRedeemAgain as () => void}
    />
  );
}

export default ConfirmationModal;
