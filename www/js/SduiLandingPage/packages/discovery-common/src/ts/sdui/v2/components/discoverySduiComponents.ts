import {
  makeTokenOrLiteralPropParser,
  UiComponentType,
  type SduiComponentDefinition,
} from "@rbx/sdui-core";
import { DiscoverySduiSectionHeader } from "./DiscoverySduiSectionHeader";
import { SduiFilterPillsCarousel } from "./filterPills/SduiFilterPillsCarousel";
import { SduiOptionSelectorCollection } from "./SduiOptionSelectorCollection";
import { SduiSlotOverlay } from "./SduiSlotOverlay";
import { SduiVariableItemWidthCarousel } from "./SduiVariableItemWidthCarousel";

export const DISCOVERY_V2_COMPONENTS: Partial<Record<UiComponentType, SduiComponentDefinition>> = {
  [UiComponentType.SECTION_HEADER]: {
    component: DiscoverySduiSectionHeader,
    propParsers: {
      verticalGap: makeTokenOrLiteralPropParser("Gap.XXSmall"),
      titleGap: makeTokenOrLiteralPropParser("Gap.XSmall"),
    },
  },
  [UiComponentType.OPTION_SELECTOR_COLLECTION]: {
    component: SduiOptionSelectorCollection,
    doesManageChildren: true,
  },
  [UiComponentType.SLOT_OVERLAY]: {
    component: SduiSlotOverlay,
    propParsers: {
      padding: makeTokenOrLiteralPropParser(),
    },
  },
  [UiComponentType.VARIABLE_ITEM_WIDTH_CAROUSEL]: {
    component: SduiVariableItemWidthCarousel,
    doesManageChildren: true,
  },
  [UiComponentType.FILTER_PILLS_CAROUSEL]: {
    component: SduiFilterPillsCarousel,
  },
};

export default DISCOVERY_V2_COMPONENTS;
