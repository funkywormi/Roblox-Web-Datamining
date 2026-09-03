import { AccountIntegrityChallengeService } from "@rbx/legacy-webapp-types/Roblox";
import { HybridWrapper } from "@rbx/account-security/challenge";
import "./src/main.css";

const { HybridTarget } = HybridWrapper;

// Keep this in sync with `challengeHybridView.html`:
const CHALLENGE_CONTAINER_ID = "challenge-container";
const CALLBACK_INPUT_ID_CHALLENGE_COMPLETED = "challenge-completed";
const CALLBACK_INPUT_ID_CHALLENGE_DISPLAYED = "challenge-displayed";
const CALLBACK_INPUT_ID_CHALLENGE_INITIALIZED = "challenge-initialized";
const CALLBACK_INPUT_ID_CHALLENGE_INVALIDATED = "challenge-invalidated";
const CALLBACK_INPUT_ID_CHALLENGE_PAGE_LOADED = "challenge-page-loaded";
const CALLBACK_INPUT_ID_CHALLENGE_PARSED = "challenge-parsed";

// Wait until `Roblox.Lang` is populated before we render the challenge.
window.addEventListener("load", () => {
  // eslint-disable-next-line no-void
  void AccountIntegrityChallengeService.HybridWrapper.renderChallengeFromQueryParameters({
    containerId: CHALLENGE_CONTAINER_ID,
    hybridTargetToCallbackInputId: {
      [HybridTarget.CHALLENGE_COMPLETED]: CALLBACK_INPUT_ID_CHALLENGE_COMPLETED,
      [HybridTarget.CHALLENGE_DISPLAYED]: CALLBACK_INPUT_ID_CHALLENGE_DISPLAYED,
      [HybridTarget.CHALLENGE_INITIALIZED]: CALLBACK_INPUT_ID_CHALLENGE_INITIALIZED,
      [HybridTarget.CHALLENGE_INVALIDATED]: CALLBACK_INPUT_ID_CHALLENGE_INVALIDATED,
      [HybridTarget.CHALLENGE_PAGE_LOADED]: CALLBACK_INPUT_ID_CHALLENGE_PAGE_LOADED,
      [HybridTarget.CHALLENGE_PARSED]: CALLBACK_INPUT_ID_CHALLENGE_PARSED,
    },
  });
});
