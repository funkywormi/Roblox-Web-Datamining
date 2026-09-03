import React from "react";
import BodyColorsContainer from "./bodyColors/BodyColorsContainer";
import ScaleContainer from "./scale/ScaleContainer";
import { Scales, ScalesKeys } from "../../../constants/types";
import AvatarItemsContent, { AvatarItemsContentConfig } from "./AvatarItemsContent";
import { CatalogItem } from "../../../avatar.types";
import { useAvatarTabsContext } from "../../../contexts/AvatarTabsContext";
import avatarConstants from "../../../constants/avatarConstants";

export type AvatarTabContentProps = {
  openEmotesModal: (selectedItem?: CatalogItem) => void;
  openAdvancedAccessories: () => void;
  onItemClicked: (item: CatalogItem, event: React.MouseEvent<HTMLElement>) => void;
  isItemSelected: (item: CatalogItem) => boolean;
  scales: Scales;
  updateScale: (newValue: number, scaleKey: ScalesKeys) => void;
  isInlineAdvancedEditorEnabled: boolean;
  advancedEditorModeEnabled: boolean;
  toggleAdvancedEditorMode: () => void;
};

function AvatarTabContent({
  openEmotesModal,
  openAdvancedAccessories,
  onItemClicked,
  isItemSelected,
  scales,
  updateScale,
  isInlineAdvancedEditorEnabled,
  advancedEditorModeEnabled,
  toggleAdvancedEditorMode,
}: AvatarTabContentProps): JSX.Element {
  const { selectedTab, selectedSubcategory } = useAvatarTabsContext();

  // Configuration for Recent Items
  const recentConfig: AvatarItemsContentConfig = {
    isActive: selectedTab?.name === "Recent",
    tabId: "recent",
    features: {
      outfitManagement: false,
      createOutfitButton: false,
      emotesModal: false,
      advancedAccessories: false,
      recommendations: false,
      pagination: true,
      continuousLoad: true,
    },
  };

  // Configuration for Assets
  const assetsConfig: AvatarItemsContentConfig = {
    isActive:
      selectedTab?.tabType === "Assets" &&
      selectedSubcategory?.name !== "BodyColors" &&
      selectedSubcategory?.name !== "Scale" &&
      selectedSubcategory?.name !== "DynamicHeads",
    tabId: "clothing",
    features: {
      outfitManagement: false,
      createOutfitButton: false,
      emotesModal: true,
      advancedAccessories: true,
      recommendations: true,
      pagination: true,
      continuousLoad: true,
    },
    actionButtons: {
      equipEmotes: {
        show: selectedSubcategory?.name === "Emote",
        onClick: () => {
          openEmotesModal();
        },
      },
      advancedAccessories: {
        show: !isInlineAdvancedEditorEnabled,
        onClick: openAdvancedAccessories,
      },
      advancedEditorToggle: {
        show: isInlineAdvancedEditorEnabled,
        isEnabled: advancedEditorModeEnabled,
        onToggle: toggleAdvancedEditorMode,
      },
    },
  };

  // Configuration for Outfits
  const outfitsConfig: AvatarItemsContentConfig = {
    isActive:
      selectedTab?.name === "Outfits" ||
      selectedTab?.name === "Costumes" ||
      (selectedTab?.name === "Body" && selectedSubcategory?.name === "DynamicHeads"),
    tabId: "costumes",
    features: {
      outfitManagement: true,
      createOutfitButton: true,
      emotesModal: false,
      advancedAccessories: false,
      recommendations: true,
      pagination: true,
      continuousLoad: true,
    },
    actionButtons: {
      createOutfit: {
        show:
          selectedSubcategory?.name !== "PresetCostumes" &&
          selectedSubcategory?.name !== "DynamicHeads",
        label: avatarConstants.outfits.createNewOutfit(
          selectedTab?.name === "Outfits" ? "Outfit" : "Costume",
        ),
        outfitType: selectedTab?.name === "Outfits" ? "Outfit" : "Costume",
      },
    },
  };

  return (
    <React.Fragment>
      <AvatarItemsContent
        config={recentConfig}
        onItemClicked={onItemClicked}
        isItemSelected={isItemSelected}
      />
      <AvatarItemsContent
        config={assetsConfig}
        onItemClicked={onItemClicked}
        isItemSelected={isItemSelected}
      />
      <BodyColorsContainer />
      <ScaleContainer scales={scales} updateScale={updateScale} />
      <AvatarItemsContent
        config={outfitsConfig}
        onItemClicked={onItemClicked}
        isItemSelected={isItemSelected}
      />
    </React.Fragment>
  );
}

export default AvatarTabContent;
