import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { CatalogItem, CatalogOutfitItem } from "../../../../avatar.types";
import AvatarItemCard from "./AvatarItemCard";
import { OutfitOption } from "../../../../types";
import { useAvatarPageContext } from "../../../../contexts/AvatarPageContext";

export type AvatarItemsProps = {
  items: CatalogItem[];
  loading: boolean;
  canLoadNextPage: boolean;
  getNextPage?: () => void;
  emptyMessage: string | (() => string);
  onItemClicked: (item: CatalogItem, event: React.MouseEvent<HTMLElement>) => void;
  activeItem?: CatalogOutfitItem | null;
  onItemMenuButtonClicked?: (
    event: React.MouseEvent,
    item: CatalogOutfitItem,
    option: OutfitOption,
  ) => void;
  openOutfitMenu?: (item: CatalogOutfitItem) => void;
  closeOutfitMenu?: () => void;
  onExpiredAssetsClick?: (item: CatalogOutfitItem) => void;
};

function AvatarItems({
  items,
  loading,
  canLoadNextPage,
  getNextPage,
  emptyMessage,
  onItemClicked,
  activeItem,
  onItemMenuButtonClicked,
  openOutfitMenu,
  closeOutfitMenu,
  onExpiredAssetsClick,
}: AvatarItemsProps): JSX.Element {
  const { translate } = useTranslation();
  const { enableContinuousLoad } = useAvatarPageContext();

  return (
    <div className="items-list avatar-item-list">
      <ul className="hlist item-cards-stackable">
        {items.map(item => (
          <li key={`avatar-item-${item.id}`} className="list-item item-card seven-column">
            {/* TODO: old, migrated code */}
            {/* eslint-disable-next-line react/no-unknown-property */}
            <div avatar-item-card />
            <AvatarItemCard
              item={item}
              isActive={activeItem?.id === item.id}
              onItemClicked={onItemClicked}
              onItemMenuButtonClicked={onItemMenuButtonClicked}
              openOutfitMenu={openOutfitMenu}
              closeOutfitMenu={closeOutfitMenu}
              onExpiredAssetsClick={onExpiredAssetsClick}
            />
          </li>
        ))}
      </ul>

      {loading && (
        <div className="loading-animated">
          <span className="spinner spinner-default" />
        </div>
      )}

      {!enableContinuousLoad && !loading && !!canLoadNextPage && (
        <div className="load-more-btn-container">
          <button type="button" className="btn-primary-md" onClick={getNextPage}>
            <span>{translate("Action.LoadMore")}</span>
          </button>
        </div>
      )}

      {!loading && items.length === 0 && !canLoadNextPage && (
        <div className="col-xs-12 section-content-off">
          <div>{emptyMessage}</div>
        </div>
      )}
    </div>
  );
}

export default AvatarItems;
