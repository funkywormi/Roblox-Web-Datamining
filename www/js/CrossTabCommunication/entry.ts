import { addExternal, addLegacyExternal } from "@rbx/externals";
import * as crossTabCommunication from "@rbx/core-scripts/util/cross-tab-communication";

addExternal(["Roblox", "core-scripts", "util", "crossTabCommunication"], crossTabCommunication);

addLegacyExternal(["Roblox", "CrossTabCommunication"], {
  PubSub: {
    IsAvailable: crossTabCommunication.pubSub.isAvailable,
    Publish: crossTabCommunication.pubSub.publish,
    Subscribe: crossTabCommunication.pubSub.subscribe,
    Unsubscribe: crossTabCommunication.pubSub.unsubscribe,
  },
  Kingmaker: {
    IsAvailable: crossTabCommunication.kingmaker.isAvailable,
    IsMasterTab: crossTabCommunication.kingmaker.isMasterTab,
    SubscribeToMasterChange: crossTabCommunication.kingmaker.subscribeToMasterChange,
    AttachLogger: crossTabCommunication.kingmaker.attachLogger,
  },
});
