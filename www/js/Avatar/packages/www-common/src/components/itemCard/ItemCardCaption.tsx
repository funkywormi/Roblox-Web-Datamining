"use client";

import type { JSX, ReactNode } from "react";
import { Icon } from "@rbx/foundation-ui";
import { useFormatter } from "../../intl";
import { escapeHtml, getProfileLink } from "./utils";
import type { ItemCardTranslate } from "./types";

type CaptionProps = {
  name: string;
  creatorName: string;
  creatorType: string;
  creatorTargetId: number;
  price: number | undefined;
  lowestPrice: number | undefined;
  priceStatus: string | undefined;
  premiumPricing: number | undefined;
  isPremiumUser: boolean;
  iconToRender?: ReactNode;
  translate: ItemCardTranslate;
};

function ItemCardName({
  name,
  premiumPricing,
}: {
  name: string;
  premiumPricing: number | undefined;
}): JSX.Element {
  const showPremiumIcon = premiumPricing !== undefined && premiumPricing >= 0;
  return (
    <div
      className="flex items-center gap-xxsmall min-width-0 text-truncate-end text-no-wrap text-body-medium content-emphasis"
      title={name}
    >
      {showPremiumIcon && <Icon name="icon-regular-premium" size="XSmall" />}
      {name}
    </div>
  );
}

function ItemCardCreatorName({
  creatorName,
  creatorType,
  creatorTargetId,
  iconToRender,
  translate,
}: {
  creatorName: string;
  creatorType: string;
  creatorTargetId: number;
  iconToRender?: ReactNode;
  translate: ItemCardTranslate;
}): JSX.Element | null {
  // Defensive: runtime API data may violate the non-null prop types.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const validInputs = creatorName != null && creatorTargetId != null && creatorType != null;
  if (!validInputs || (creatorTargetId === 1 && creatorType === "User")) {
    return null;
  }
  return (
    <div className="flex items-center gap-xxsmall min-width-0 text-truncate-end text-no-wrap text-body-small content-muted">
      <span
        className="text-truncate-end text-no-wrap"
        // Preserves the existing `Label.ByCreatorLink` translation (which embeds the
        // anchor); works with the dual-compatible `(key, params) => string` contract.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          // eslint-disable-next-line @typescript-eslint/naming-convention
          __html: translate("Label.ByCreatorLink", {
            linkStart: `<a target=_self class='content-action-link' href='${getProfileLink(
              creatorTargetId,
              creatorType,
              escapeHtml(creatorName),
            )}'>`,
            linkEnd: "</a>",
            creator: escapeHtml(`${creatorType === "User" ? "@" : ""}${creatorName}`),
          }),
        }}
      />
      {iconToRender}
    </div>
  );
}

function ItemCardPrice({
  price,
  lowestPrice,
  priceStatus,
  premiumPricing,
  isPremiumUser,
}: {
  price: number | undefined;
  lowestPrice: number | undefined;
  priceStatus: string | undefined;
  premiumPricing: number | undefined;
  isPremiumUser: boolean;
}): JSX.Element {
  const { number } = useFormatter();

  const getPriceForItem = (): number => {
    if (isPremiumUser && premiumPricing !== undefined && premiumPricing >= 0) {
      return premiumPricing;
    }
    if (lowestPrice !== undefined && lowestPrice >= 0) {
      return lowestPrice;
    }
    return price ?? 0;
  };

  return (
    <div className="flex items-center gap-xxsmall min-width-0 text-body-medium content-emphasis">
      {priceStatus ? (
        <span>{priceStatus}</span>
      ) : (
        <>
          <Icon name="icon-regular-robux" size="Small" />
          <span>{number(getPriceForItem())}</span>
        </>
      )}
    </div>
  );
}

function ItemCardCaption({
  name,
  creatorName,
  creatorType,
  creatorTargetId,
  price,
  lowestPrice,
  priceStatus,
  premiumPricing,
  isPremiumUser,
  iconToRender,
  translate,
}: CaptionProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const hideCreatorName = creatorName == null;
  const hidePrice =
    price === undefined &&
    lowestPrice === undefined &&
    premiumPricing === undefined &&
    priceStatus === undefined;

  return (
    <div className="flex flex-col gap-xxsmall min-width-0">
      <ItemCardName name={name} premiumPricing={premiumPricing} />
      {!hideCreatorName && (
        <ItemCardCreatorName
          creatorName={creatorName}
          creatorType={creatorType}
          creatorTargetId={creatorTargetId}
          iconToRender={iconToRender}
          translate={translate}
        />
      )}
      {!hidePrice && (
        <ItemCardPrice
          price={price}
          lowestPrice={lowestPrice}
          priceStatus={priceStatus}
          premiumPricing={premiumPricing}
          isPremiumUser={isPremiumUser}
        />
      )}
    </div>
  );
}

export default ItemCardCaption;
