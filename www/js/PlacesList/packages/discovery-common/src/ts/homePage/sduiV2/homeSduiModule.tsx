import React from "react";
import {
  SduiCollectionGridWrapperV2,
  type SduiCollectionGridWrapperV2Props,
} from "@rbx/sdui-client";
import { UiComponentType, type SduiRegistryModule } from "@rbx/sdui-core";

// Legacy Home game grids space rows 24px apart vertically while keeping the responsive column gap.
export const HOME_COLLECTION_GRID_ROW_GAP = 24;

export function HomeCollectionGrid({
  rowGap,
  ...restProps
}: SduiCollectionGridWrapperV2Props): React.JSX.Element | null {
  return (
    <SduiCollectionGridWrapperV2 {...restProps} rowGap={rowGap ?? HOME_COLLECTION_GRID_ROW_GAP} />
  );
}

export const HomeSduiModule = {
  name: "home",
  components: {
    [UiComponentType.COLLECTION_GRID]: {
      component: HomeCollectionGrid,
      doesManageChildren: true,
    },
  },
} satisfies SduiRegistryModule;
