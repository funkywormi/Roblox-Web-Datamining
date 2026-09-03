import React, { useCallback } from "react";
import classNames from "classnames";
import { Thumbnail2d, ThumbnailAvatarsSize } from "@rbx/thumbnails";
import { Thumbnail3d } from "@rbx/thumbnails3d";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button, Icon } from "@rbx/foundation-ui";
import { getCurrentUserId } from "../utils/currentUser";
import { DEFAULT_CLASSIC_HEAD } from "../constants/avatarConstants";
import { useCurrentlyWearingAssetsStoreContext } from "../contexts/CurrentlyWearingAssetsStoreContext";
import { HatSlot, isEmptySlot, CategorySlot, isEmptyCategorySlot } from "../types";
import { useAssetManagerContext } from "../contexts/AssetManagerContext";
import { useAvatarTabsContext } from "../contexts/AvatarTabsContext";
import { useAvatarPageContext } from "../contexts/AvatarPageContext";
import { getSlotConfig } from "../constants/slotConfigurations";
import { CategorySlots, SlotItem } from "./slots";

interface AvatarBackProps {
  onHatSlotClicked: (slot: HatSlot) => void;
  version: number;
  selectedOutfitSupportsHeadShapes?: boolean;
  is3d: boolean;
  avatarToggleButton: string;
  toggleThreeDee: () => void;
}

const AvatarBack: React.FC<AvatarBackProps> = ({
  version,
  onHatSlotClicked,
  selectedOutfitSupportsHeadShapes = false,
  is3d,
  avatarToggleButton,
  toggleThreeDee,
}) => {
  const { translate } = useTranslation();
  const {
    hatSlots,
    layeredClothingSlots,
    classicHeadSlots,
    makeupSlots,
    eyebrowSlot,
    eyelashSlot,
    isLayeredClothingCategory,
    onLayeredClothingSlotClicked,
    showLayeredClothingSlotUp,
    showLayeredClothingSlotDown,
    onLayeredClothingSlotUp,
    onLayeredClothingSlotDown,
    showMakeupSlotUp,
    showMakeupSlotDown,
    onMakeupSlotUp,
    onMakeupSlotDown,
    defaultClassicHeadSlotClicked,
    onClassicHeadSlotClicked,
    onHeadShapeSlotClicked,
    isDefaultClassicHeadSelected,
    isClassicHeadItemSelected,
    isHeadShapeSelected,
    removeAsset,
  } = useAssetManagerContext();

  const eyebrowSlotConfig = getSlotConfig("eyebrow");
  const eyelashSlotConfig = getSlotConfig("eyelash");
  const layeredClothingSlotConfig = getSlotConfig("layeredClothing");

  const { selectedSubcategory, selectedCategoryRow, selectedTab } = useAvatarTabsContext();

  const { avatarThumbnailDataModel, avatarSettings, headShapes } = useAvatarPageContext();

  const { currentlyWornAssetsList } = useCurrentlyWearingAssetsStoreContext();

  const dynamicHeadAssetId = currentlyWornAssetsList.find(asset => asset.assetType.id === 79)?.id;

  const areThreeDeeThumbsEnabled = avatarSettings?.areThreeDeeThumbsEnabled;

  const makeupSlotConfig = getSlotConfig("makeup");
  const hatSlotConfig = getSlotConfig("hats");

  const handleMakeupSlotClicked = useCallback(
    (slot: CategorySlot) => {
      if (!isEmptyCategorySlot(slot)) {
        const asset = currentlyWornAssetsList.find(a => a.id === slot.id);
        if (asset) {
          removeAsset(asset).catch(() => {
            // Error handled elsewhere
          });
        }
      }
    },
    [removeAsset, currentlyWornAssetsList],
  );

  const isInMakeupCategory =
    selectedTab?.name === "Makeup" || selectedSubcategory?.slotConfigId === "makeup";

  const handleHatSlotClicked = useCallback(
    (slot: CategorySlot) => {
      if (!isEmptyCategorySlot(slot)) {
        onHatSlotClicked(slot as HatSlot);
      }
    },
    [onHatSlotClicked],
  );

  const handleLayeredClothingSlotClicked = useCallback(
    (slot: CategorySlot) => {
      if (!isEmptyCategorySlot(slot)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onLayeredClothingSlotClicked(slot as any);
      }
    },
    [onLayeredClothingSlotClicked],
  );

  if (!avatarThumbnailDataModel) {
    return null;
  }

  return (
    <div className="avatar-back">
      {/* Hat Slots */}
      {selectedSubcategory?.name === "Hats" && hatSlotConfig && (
        <CategorySlots
          slots={hatSlots as CategorySlot[]}
          slotConfig={hatSlotConfig}
          onSlotClicked={handleHatSlotClicked}
          translate={translate}
        />
      )}

      {/* Makeup Slots - Eyebrow and Eyelash (protected, 1 each) + General Makeup (6 slots) */}
      {isInMakeupCategory && makeupSlotConfig && (
        <div className={makeupSlotConfig.cssClass}>
          {/* Eyebrow Slot (protected - only 1 allowed) */}
          {eyebrowSlotConfig && (
            <SlotItem
              slot={eyebrowSlot}
              slotConfig={eyebrowSlotConfig}
              onSlotClicked={handleMakeupSlotClicked}
              translate={translate}
            />
          )}
          {/* Eyelash Slot (protected - only 1 allowed) */}
          {eyelashSlotConfig && (
            <SlotItem
              slot={eyelashSlot}
              slotConfig={eyelashSlotConfig}
              onSlotClicked={handleMakeupSlotClicked}
              translate={translate}
            />
          )}
          {/* General Makeup Slots (6 slots for Eye Makeup, Face Makeup, Lip Makeup) */}
          {makeupSlots.map((slot, index) => (
            <SlotItem
              key={isEmptyCategorySlot(slot) ? `makeup-empty-${index}` : slot.id}
              slot={slot}
              slotConfig={makeupSlotConfig}
              onSlotClicked={handleMakeupSlotClicked}
              showSlotUp={showMakeupSlotUp}
              showSlotDown={showMakeupSlotDown}
              onSlotUp={onMakeupSlotUp}
              onSlotDown={onMakeupSlotDown}
              translate={translate}
            />
          ))}
        </div>
      )}

      {/* Layered Clothing Slots */}
      {isLayeredClothingCategory(selectedSubcategory?.assetType, selectedCategoryRow) &&
        layeredClothingSlotConfig && (
          <CategorySlots
            slots={layeredClothingSlots as CategorySlot[]}
            slotConfig={layeredClothingSlotConfig}
            onSlotClicked={handleLayeredClothingSlotClicked}
            showSlotUp={showLayeredClothingSlotUp as (slot: CategorySlot) => boolean}
            showSlotDown={showLayeredClothingSlotDown as (slot: CategorySlot) => boolean}
            onSlotUp={onLayeredClothingSlotUp as (slot: CategorySlot) => void}
            onSlotDown={onLayeredClothingSlotDown as (slot: CategorySlot) => void}
            translate={translate}
            reverseOrder
          />
        )}

      {/* Classic Heads */}
      {selectedSubcategory?.assetType === "Face" && (
        <div id="classic-heads-scrollbar-container" className="classic-head-slots">
          <div title={translate("Message.HatLimitTooltip")} className="slot">
            {!isEmptySlot(DEFAULT_CLASSIC_HEAD) && (
              <React.Fragment>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => defaultClassicHeadSlotClicked()}
                  style={{ cursor: "pointer" }}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      defaultClassicHeadSlotClicked().catch(() => {
                        // Error handled elsewhere
                      });
                    }
                  }}
                >
                  <Thumbnail2d
                    targetId={DEFAULT_CLASSIC_HEAD.id}
                    type={DEFAULT_CLASSIC_HEAD.thumbnailType}
                  />
                </div>
                {isDefaultClassicHeadSelected && (
                  <div className="checkbox">
                    <Icon name="icon-filled-check" size="Small" />
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
          {classicHeadSlots.map((slot, index) => {
            return (
              <div
                key={isEmptySlot(slot) ? `classic-head-empty-${index}` : slot.id}
                title={translate("Message.HatLimitTooltip")}
                className="slot"
              >
                {!isEmptySlot(slot) && (
                  <React.Fragment>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        onClassicHeadSlotClicked(slot);
                      }}
                      style={{ cursor: "pointer" }}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          onClassicHeadSlotClicked(slot);
                        }
                      }}
                    >
                      <Thumbnail2d targetId={slot.id} type={slot.thumbnailType} />
                    </div>
                    {isClassicHeadItemSelected(slot) && (
                      <div className="checkbox">
                        <Icon name="icon-filled-check" size="Small" />
                      </div>
                    )}
                  </React.Fragment>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Head Shapes for Outfits that Support Head Shapes - only in DynamicHeads tab */}
      {selectedOutfitSupportsHeadShapes &&
        selectedSubcategory?.name === "DynamicHeads" &&
        dynamicHeadAssetId && (
          <div id="head-shapes-scrollbar-container" className="classic-head-slots">
            {headShapes
              .filter(
                (headShape: string | undefined): headShape is string => headShape !== undefined,
              )
              .map((headShape: string) => {
                return (
                  <div key={headShape} title={headShape} className="slot">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        onHeadShapeSlotClicked(headShape);
                      }}
                      style={{ cursor: "pointer" }}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          onHeadShapeSlotClicked(headShape);
                        }
                      }}
                    >
                      <Thumbnail2d
                        targetId={dynamicHeadAssetId}
                        type="Asset"
                        headShape={headShape}
                      />
                    </div>
                    {isHeadShapeSelected(headShape) && (
                      <div className="checkbox">
                        <Icon name="icon-filled-check" size="Small" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

      {/* Avatar Thumbnail */}
      <div
        className={classNames("avatar-thumbnail", {
          "slots-visible":
            selectedSubcategory?.name === "Hats" ||
            isLayeredClothingCategory(selectedSubcategory?.assetType, selectedCategoryRow),
        })}
      >
        <div
          id="UserAvatar"
          className={classNames(
            "3d-thumbs-enabled",
            "thumbnail-holder",
            "delayed-thumbnail-holder",
            {
              "3d-thumbs-enabled": areThreeDeeThumbsEnabled,
            },
          )}
        >
          {is3d ? (
            <Thumbnail3d
              version={version.toString()}
              targetId={getCurrentUserId()}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
              onSuccess={avatarThumbnailDataModel.on3dAvatarSuccess as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
              onFailure={avatarThumbnailDataModel.on3dAvatarFailure as any}
            />
          ) : (
            <Thumbnail2d
              version={version.toString()}
              targetId={getCurrentUserId()}
              type={avatarThumbnailDataModel.thumbnailType}
              size={ThumbnailAvatarsSize.size352}
              includeBackground
            />
          )}

          <Button
            className="toggle-three-dee"
            variant="Standard"
            size="Medium"
            onClick={toggleThreeDee}
          >
            {translate(avatarToggleButton)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarBack;
