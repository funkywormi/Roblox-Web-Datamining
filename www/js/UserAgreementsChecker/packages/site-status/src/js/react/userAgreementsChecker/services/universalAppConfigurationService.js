import { Guac } from "@rbx/legacy-webapp-types/Roblox";

export default {
  getCooldownPeriodInMs() {
    return Guac.callBehaviour("user-agreements-policy");
  },
};
