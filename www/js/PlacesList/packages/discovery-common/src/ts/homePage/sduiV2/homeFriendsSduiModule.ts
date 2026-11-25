import { UiComponentType, type SduiRegistryModule } from "@rbx/sdui-core";
import { SduiFriendCarousel } from "./SduiFriendCarousel";

/**
 * Home-only registration for the friends row.
 */
export const HomeFriendsSduiModule = {
  name: "home-friends",
  components: {
    [UiComponentType.FRIEND_CAROUSEL]: {
      component: SduiFriendCarousel,
    },
  },
} satisfies SduiRegistryModule;
