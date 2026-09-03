/* eslint-disable @typescript-eslint/no-floating-promises */

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { useState, useEffect, useCallback, useRef } from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { reportAXError } from "../../../utils/axAnalyticsService";
import avatarConstants from "../../../constants/avatarConstants";
import AvatarAPIService, { InventoryEmote } from "../../../services/avatarAPIService";
import { EmoteRequestModel } from "../../../types/updateAvatarV4.types";
import { CatalogItem } from "../../../avatar.types";
import useAssetsList from "../../tabs/tabContent/avatarItems/useAssetsList";
import EmotesItemCard from "./EmotesItemCard";
import { useSystemFeedback } from "../../../contexts/SystemFeedbackContext";
import { useAvatarPageContext } from "../../../contexts/AvatarPageContext";
import parseError from "../../../utils/parseErrorUtil";
import { trackAvatarEdit, AvatarEditorTrackingEvents } from "../../../utils/axTracking";

type SliceBase = {
  position: number;
};

type SliceWithAsset = SliceBase & {
  isEmpty: false;
  assetId: number;
};

type EmptySlice = SliceBase & {
  isEmpty: true;
};

type Slice = SliceWithAsset | EmptySlice;

type EmotesRadialMenuProps = {
  selectedItem: CatalogItem | undefined;
};

const numberOfEmotePositions = 8;
const emoteConstants = avatarConstants.emotes;

function EmotesRadialMenu({ selectedItem }: EmotesRadialMenuProps): JSX.Element {
  const { translate } = useTranslation();
  const { enableContinuousLoad } = useAvatarPageContext();
  const systemFeedback = useSystemFeedback();

  const [hoveredPositionIndex, setHoveredPositionIndex] = useState<number | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(
    !selectedItem ? null : selectedItem.id,
  );
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<number | null>(null);
  const [radialSlices, setRadialSlices] = useState<Record<number, Slice>>({});
  const [isRequestDelete, setIsRequestDelete] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const isItemSelected = useCallback((item: CatalogItem) => {
    return false;
  }, []);

  const { items, loading, canLoadNextPage, getNextPage, emptyMessage } = useAssetsList({
    isItemSelected,
    translate,
  });

  const deselectAll = () => {
    setSelectedAssetId(null);
    setSelectedPositionIndex(null);
    setHoveredPositionIndex(null);
    setIsRequestDelete(false);
  };

  const getEquippedEmotes = (slices: Record<number, Slice>): EmoteRequestModel[] =>
    Object.values(slices)
      .filter((slice): slice is SliceWithAsset => !slice.isEmpty)
      .map(({ assetId, position }) => ({ assetId, position }));

  const initEmotes = useCallback(async () => {
    try {
      const response = await AvatarAPIService.getEmotes();
      const slices: Record<number, Slice> = {};

      // Populate radial slices with existing emotes

      response.forEach((emote: InventoryEmote) => {
        const { assetId, position } = emote;
        slices[position] = { position, isEmpty: false, assetId };
      });

      // Fill empty positions
      for (let j = 1; j <= numberOfEmotePositions; j++) {
        if (!slices[j]) {
          slices[j] = { position: j, isEmpty: true };
        }
      }

      setRadialSlices(slices);
    } catch (error) {
      reportAXError({
        itemName: "GetEmotesError",
        counterName: "AvatarEditorError",
        log: parseError(error),
      });

      console.error(error);
      systemFeedback.error(emoteConstants.errorGettingEmotes);
    }
  }, [systemFeedback]);

  useEffect(() => {
    initEmotes();
  }, [initEmotes]);

  useEffect(() => {
    if (!canLoadNextPage()) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry!.isIntersecting && !loading) {
          getNextPage();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [canLoadNextPage, loading, getNextPage]);

  const equipEmote = async (assetId: number, positionIndex: number) => {
    try {
      await AvatarAPIService.equipEmote(assetId, positionIndex, getEquippedEmotes(radialSlices));
      trackAvatarEdit(AvatarEditorTrackingEvents.EmoteChange, {
        action: "equip",
        assetId,
        position: positionIndex,
      });
      setRadialSlices(prev => ({
        ...prev,
        [positionIndex]: { position: positionIndex, isEmpty: false, assetId },
      }));
      systemFeedback.success(emoteConstants.successfulUpdate);
      deselectAll();
    } catch (error) {
      reportAXError({
        itemName: "EquipEmotesError",
        counterName: "AvatarEditorError",
        log: parseError(error),
      });

      systemFeedback.error(emoteConstants.errorUpdatingEmote);
    }
  };

  const confirmDelete = async () => {
    if (selectedPositionIndex !== null) {
      try {
        await AvatarAPIService.unequipEmote(selectedPositionIndex, getEquippedEmotes(radialSlices));
        trackAvatarEdit(AvatarEditorTrackingEvents.EmoteChange, {
          action: "unequip",
          position: selectedPositionIndex,
        });
        setRadialSlices(prev => ({
          ...prev,
          [selectedPositionIndex]: {
            position: selectedPositionIndex,
            isEmpty: true,
            assetId: null,
          },
        }));
        systemFeedback.success(emoteConstants.successfulDelete);
      } catch (error) {
        reportAXError({
          itemName: "UnequipEmotesError",
          counterName: "AvatarEditorError",
          log: parseError(error),
        });

        systemFeedback.error(emoteConstants.errorDeletingEmote);
      }
      setIsRequestDelete(false);
      deselectAll();
    }
  };

  const onEmotesPositionClick = (positionIndex: number, isEmpty: boolean) => {
    if (!selectedAssetId) {
      if (selectedPositionIndex === null || selectedPositionIndex !== positionIndex) {
        setSelectedPositionIndex(positionIndex);
        setIsRequestDelete(!isEmpty);
      } else {
        deselectAll();
      }
    } else {
      equipEmote(selectedAssetId, positionIndex);
    }
  };

  const onEmotesCardClick = (assetId: number) => {
    if (selectedPositionIndex === null) {
      setSelectedAssetId(prev => (prev === assetId ? null : assetId));
    } else {
      equipEmote(assetId, selectedPositionIndex);
    }
  };

  const onHoverPosition = (position: number) => {
    setHoveredPositionIndex(position);
  };
  const resetHoveredPosition = () => {
    setHoveredPositionIndex(selectedPositionIndex);
  };

  return (
    <div>
      <div className="emotes-radial-menu" onMouseLeave={resetHoveredPosition}>
        <div className="emotes-radial-background-layer">
          {hoveredPositionIndex !== null && (
            <div
              className={classNames(
                "emotes-radial-selected-position-image",
                `emotes-radial-slice-${hoveredPositionIndex - 1}`,
              )}
            />
          )}
          <div className="emotes-radial-img" />

          {selectedAssetId === null && selectedPositionIndex === null && (
            <div className="text-emphasis emotes-radial-middle-text emotes-center-div">
              {translate("Message.ChooseEmoteSlotOrEmote")}
            </div>
          )}
          {selectedAssetId === null && selectedPositionIndex !== null && (
            <div className="text-emphasis emotes-radial-middle-text emotes-center-div">
              {translate("Message.ChooseEmote")}
            </div>
          )}
          {selectedAssetId !== null && selectedPositionIndex === null && (
            <div className="text-emphasis emotes-radial-middle-text emotes-center-div">
              {translate("Message.ChooseEmoteSlot")}
            </div>
          )}
        </div>

        <div className="emotes-radial-menu-offset">
          {Object.values(radialSlices).map(slice => (
            <div key={slice.position} className="emotes-radial-slice-container">
              <div
                className={classNames(
                  "text-emphasis",
                  "emotes-radial-slice",
                  `emotes-radial-slice-${slice.position - 1}`,
                )}
              >
                <div
                  className="emotes-radial-button"
                  onClick={() => {
                    onEmotesPositionClick(slice.position, slice.isEmpty);
                  }}
                  onMouseOver={() => {
                    onHoverPosition(slice.position);
                  }}
                >
                  {!slice.isEmpty && (
                    <div
                      className={classNames(
                        "emotes-radial-icon",
                        `emotes-radial-inverse-${slice.position - 1}`,
                      )}
                    >
                      <div
                        className={classNames("emotes-radial-thumb", {
                          "slice-is-hovered": hoveredPositionIndex === slice.position,
                        })}
                      >
                        <Thumbnail2d
                          containerClass={classNames("emotes-radial-thumbnail", {
                            "slice-is-hovered": hoveredPositionIndex === slice.position,
                          })}
                          targetId={slice.assetId?.toString()}
                          type={ThumbnailTypes.assetThumbnail}
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={classNames(
                      "emotes-radial-index",
                      `emotes-radial-inverse-${slice.position - 1}`,
                    )}
                  >
                    {slice.position}
                  </div>
                  {(selectedPositionIndex === slice.position ||
                    (selectedAssetId !== null && hoveredPositionIndex === slice.position)) && (
                    <div className="emotes-on-state-icon" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div>{translate("Label.YourEmotes")}</div>
        <div className="emotes-grid">
          <div className="items-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
            <ul className="hlist item-cards-stackable">
              {isRequestDelete && (
                <li
                  className="list-item item-card seven-column delete-confirmation-card-react"
                  onClick={confirmDelete}
                >
                  <div className="item-card-container">
                    <div className="item-card-link">
                      <div className="item-card-thumb-container">
                        <div className="emotes-center-div">
                          <div className="icon-close" />
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )}
              {items.map((item, index) => (
                <li key={`emote-${item.id}`} className="list-item item-card seven-column">
                  <EmotesItemCard
                    item={item}
                    isSelected={selectedAssetId === item.id}
                    onEmotesCardClick={onEmotesCardClick}
                  />
                </li>
              ))}
            </ul>
            {enableContinuousLoad && canLoadNextPage() && (
              <div ref={loadMoreRef} style={{ height: "20px" }} />
            )}
          </div>
          {loading && (
            <div className="loading-animated">
              <span className="spinner spinner-default" />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="col-xs-12 section-content-off">
              <div>{emptyMessage}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmotesRadialMenu;
