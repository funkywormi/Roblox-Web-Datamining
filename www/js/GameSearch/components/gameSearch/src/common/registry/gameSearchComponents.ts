import { UiComponentType, type SduiComponentDefinition } from "@rbx/sdui-core";
import { SduiCollectionGridWrapperV2 } from "@rbx/sdui-client";

export const GAME_SEARCH_CLIENT_COMPONENTS: Partial<
  Record<UiComponentType, SduiComponentDefinition>
> = {
  [UiComponentType.COLLECTION_GRID]: {
    component: SduiCollectionGridWrapperV2,
    doesManageChildren: true,
  },
};
