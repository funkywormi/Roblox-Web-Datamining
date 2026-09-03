import environmentUrls from "@rbx/environment-urls";
import { pubSub as pubSubUntyped } from "@rbx/core-scripts/util/cross-tab-communication";
import ready from "../../util/ready";
import { get } from "../../http";
import { getClient } from "../lib/client";

interface RealtimeClient {
  Subscribe: (namespace: string, handler: (data: { Type?: string }) => void) => void;
}

// Untyped JS modules — cast at the boundary.
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
const getRealtimeClient = getClient as unknown as () => RealtimeClient;
const pubSub = pubSubUntyped as {
  isAvailable: () => boolean;
  subscribe: (key: string, subscriberId: string, callback: (newValue: unknown) => void) => void;
};
/* eslint-enable @typescript-eslint/no-unsafe-type-assertion */

if (typeof document !== "undefined") {
  ready(() => {
    getRealtimeClient().Subscribe("AuthenticationNotifications", data => {
      if (data.Type === "SignOut") {
        const url = `${environmentUrls.usersApi}/v1/users/authenticated`;
        get({ url, withCredentials: true }).catch((error: unknown) => {
          if (
            typeof error === "object" &&
            error !== null &&
            "status" in error &&
            error.status === 401
          ) {
            window.location.reload();
          }
        });
      }
    });

    // Cross-tab account switch → reload.
    if (pubSub.isAvailable()) {
      pubSub.subscribe(
        "RBXASAccountSwitched",
        "Roblox.Authentication.AccountSwitchHandler",
        newValue => {
          if (!newValue) {
            window.location.reload();
          }
        },
      );
    }
  });
}
