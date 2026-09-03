import React, { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { useAvatarEditingAccessContext } from "../contexts/AvatarEditingAccessContext";
import {
  LayeredClothingBodyTypeWarningDialog,
  ItemLimitExceededDialog,
  AdvancedAccessoriesDialog,
  EquipEmotesDialog,
  AvatarEditingBlockedDialog,
} from "./dialogs";
import { AvatarEditorTabs, AvatarTabContentHeader, AvatarTabContent } from "./tabs";
import AvatarBack from "./AvatarBack";
import AvatarBodyTypeScale from "./AvatarScaling/AvatarBodyTypeScale";
import AvatarScaling from "./AvatarScaling/AvatarScaling";
import {
  useRefreshAvatarOnPageFocus,
  useAvatarScaleController,
  useResponsiveAvatarColumns,
  useThreeDToggle,
} from "../hooks";
import { useAssetManagerContext } from "../contexts/AssetManagerContext";
import { useCurrentlyWearingAssetsStoreContext } from "../contexts/CurrentlyWearingAssetsStoreContext";
import { useAvatarPageContext } from "../contexts/AvatarPageContext";
import { useAvatarTabsContext } from "../contexts/AvatarTabsContext";
import RedrawThumbnailButton from "./RedrawThumbnailButton";
import FacialAnimationSwitch from "./FacialAnimationSwitch";
import useOutfitHelpers from "../hooks/useOutfitHelpers";
import { useAvatarBodyColorsContext } from "../contexts/AvatarBodyColorsContext";
import { trackAvatarEditorClick, AvatarEditorTrackingEvents } from "../utils/axTracking";
import { sendAXTracking, AXAnalyticsConstants } from "../utils/axAnalyticsService";

function AvatarPage(): JSX.Element {
  const { translate } = useTranslation();
  const [version, setVersion] = useState<number>(0);
  const timeoutRef = useRef<number>();
  const [isEditingBlockedDialogOpen, setIsEditingBlockedDialogOpen] = useState(false);

  const {
    isAvatarEditingBlocked,
    formattedBlockEndTime,
    isLoading: isAccessLoading,
  } = useAvatarEditingAccessContext();

  // IXP flag - will be wired to experimentation service
  // When true, shows inline toggle instead of Advanced Editor modal button
  const [isInlineAdvancedEditorEnabled] = useState<boolean>(false);

  // User toggle state - only relevant when IXP flag is enabled
  // When true, shows extended accessory slots (10 max) in accessories categories
  const [advancedEditorModeEnabled, setAdvancedEditorModeEnabled] = useState<boolean>(false);

  const toggleAdvancedEditorMode = useCallback(() => {
    setAdvancedEditorModeEnabled(prev => {
      const enabled = !prev;
      trackAvatarEditorClick(AvatarEditorTrackingEvents.AdvancedEditor, {
        action: "toggle",
        enabled,
      });
      return enabled;
    });
  }, []);

  useResponsiveAvatarColumns();

  useEffect(() => {
    sendAXTracking({ itemName: AXAnalyticsConstants.AvatarEditorView });
  }, []);

  useEffect(() => {
    if (!isAccessLoading && isAvatarEditingBlocked && formattedBlockEndTime) {
      setIsEditingBlockedDialogOpen(true);
    }
  }, [isAccessLoading, isAvatarEditingBlocked, formattedBlockEndTime]);

  const forceRefreshThumbnail = useCallback(() => {
    setVersion(prevVersion => prevVersion + 1);
  }, []);

  const { is3d, avatarToggleButton, toggleThreeDee, switchToTwoDee } = useThreeDToggle();

  const { currentlyWornAssetsList } = useCurrentlyWearingAssetsStoreContext();

  const { removeAsset } = useAssetManagerContext();

  const { loadAvatarDetails, avatarType, avatarRules, avatarSettings, avatarDetails, pageLoaded } =
    useAvatarPageContext();

  const handleIdle = useCallback(
    (idleSeconds: number) => {
      // console.log("Page didn't have focus for ", idleSeconds);
      // TODO: check avatar details to see if any have changed before reloading
      loadAvatarDetails();
      forceRefreshThumbnail();
    },
    [loadAvatarDetails, forceRefreshThumbnail],
  );

  useRefreshAvatarOnPageFocus(handleIdle);

  const [isAdvancedAccessoriesModalOpen, setIsAdvancedAccessoriesModalOpen] = useState(false);

  const openAdvancedAccessories = useCallback(() => {
    trackAvatarEditorClick(AvatarEditorTrackingEvents.AdvancedEditor, { action: "openModal" });
    setIsAdvancedAccessoriesModalOpen(true);
  }, []);

  const {
    onItemClicked,
    isItemSelected,
    emoteToEquip,
    openEmotesModal,
    closeEmotesModal,
    isEquipEmotesModalOpen,
    isItemLimitedExceededDialogOpen,
    setIsItemLimitedExceededDialogOpen,
    bodyTypeWarningAssetToWear,
    setBodyTypeWarningAssetToWear,
    currentOutfitSupportsHeadShapes,
  } = useOutfitHelpers(
    forceRefreshThumbnail,
    translate,
    isInlineAdvancedEditorEnabled && advancedEditorModeEnabled,
    switchToTwoDee,
  );

  const { scales, updateScale } = useAvatarScaleController(
    avatarRules,
    avatarSettings,
    avatarDetails,
  );

  const { bodyColors } = useAvatarBodyColorsContext();

  const { selectedSubcategory } = useAvatarTabsContext();
  const isInHeadsCategory = selectedSubcategory?.name === "DynamicHeads";

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // TODO - if currentlyWorkAssetsList is what triggered the update, then we should only update the version if the changed asset is not an animation
    // if (!AvatarAccoutrementService.isAnimation(assetToRemove.assetType.name)) {
    //   updateThumbnailAfterSet = true;
    // }

    timeoutRef.current = window.setTimeout(() => {
      setVersion(prevVersion => {
        return prevVersion + 1;
      });
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentlyWornAssetsList, scales, avatarType, bodyColors]);

  return (
    <div>
      {/* Header */}
      <div className="avatar-editor-header">
        <h1>{translate("Heading.AvatarPageTitle")}</h1>
        <div className="catalog-header">
          <div>{translate("Label.ExploreMarketplace")}</div>
          <a
            href={getAbsoluteUrl("/catalog")}
            className="btn-primary-md"
            onClick={() => {
              trackAvatarEditorClick(AvatarEditorTrackingEvents.GetMoreClick, {
                destination: "catalog",
              });
            }}
          >
            {translate("Action.GetMore")}
          </a>
        </div>
      </div>

      <LayeredClothingBodyTypeWarningDialog
        closeDialog={() => {
          setBodyTypeWarningAssetToWear(null);
        }}
        assetToWear={bodyTypeWarningAssetToWear}
      />

      <ItemLimitExceededDialog
        isOpen={isItemLimitedExceededDialogOpen}
        closeDialog={() => {
          setIsItemLimitedExceededDialogOpen(false);
        }}
      />

      <AdvancedAccessoriesDialog
        closeDialog={() => {
          setIsAdvancedAccessoriesModalOpen(false);
        }}
        isOpen={isAdvancedAccessoriesModalOpen}
      />

      <EquipEmotesDialog
        isOpen={isEquipEmotesModalOpen}
        closeDialog={closeEmotesModal}
        selectedItem={emoteToEquip}
      />

      <AvatarEditingBlockedDialog
        isOpen={isEditingBlockedDialogOpen}
        closeDialog={() => {
          setIsEditingBlockedDialogOpen(false);
        }}
        formattedBlockEndTime={formattedBlockEndTime || ""}
      />

      {/* Left Side Begin */}
      <div className="left-wrapper-placeholder">
        <div className="left-wrapper">
          <div className="section-content remove-panel">
            {/* Avatar Back Component */}
            <AvatarBack
              version={version}
              onHatSlotClicked={
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                removeAsset as (slot: HatSlot) => void
              }
              selectedOutfitSupportsHeadShapes={currentOutfitSupportsHeadShapes}
              is3d={is3d}
              avatarToggleButton={avatarToggleButton}
              toggleThreeDee={toggleThreeDee}
            />
            <AvatarBodyTypeScale scales={scales} updateScale={updateScale} />
            {!avatarSettings?.isAvatarScaleEmbeddedInTab && (
              <AvatarScaling scales={scales} updateScale={updateScale} />
            )}
          </div>

          <RedrawThumbnailButton forceRefreshThumbnail={forceRefreshThumbnail} />
          {isInHeadsCategory && <FacialAnimationSwitch />}
        </div>
      </div>

      {/* Right Panel */}
      {!pageLoaded ? (
        <div className="right-panel seven-column">
          <span className="spinner spinner-default" />
        </div>
      ) : (
        <div
          className={classNames("right-panel", "seven-column", {
            invisible: !pageLoaded,
          })}
        >
          <div className="right-wrapper-placeholder right-wrapper-placeholder-seven-column">
            <div className="right-wrapper right-wrapper-seven-column">
              <AvatarEditorTabs />
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content rbx-tab-content">
            <div id="tab-content-top" />
            <AvatarTabContentHeader />

            <AvatarTabContent
              openEmotesModal={openEmotesModal}
              openAdvancedAccessories={openAdvancedAccessories}
              onItemClicked={onItemClicked}
              isItemSelected={isItemSelected}
              scales={scales}
              updateScale={updateScale}
              isInlineAdvancedEditorEnabled={isInlineAdvancedEditorEnabled}
              advancedEditorModeEnabled={advancedEditorModeEnabled}
              toggleAdvancedEditorMode={toggleAdvancedEditorMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AvatarPage;
