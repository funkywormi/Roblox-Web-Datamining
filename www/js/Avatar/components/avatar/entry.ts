import renderAvatarReactComponent from "./src/utils/avatarPageMounter";
import constants from "./src/constants";
import "./src/css/avatar-non-fui.css";
import "./src/css/emotes-non-fui.css";
import "./src/css/main.css";

const { isEligibleForUpsell } = constants;

if (!isEligibleForUpsell) {
  const webAppContainer =
    document.getElementById("avatar-container") || document.getElementById("avatar-web-app");

  if (webAppContainer?.id === "avatar-web-app") {
    webAppContainer.classList.add("row", "page-content");
    const webAppAvatarBase = document.createElement("div");
    webAppAvatarBase.setAttribute("avatar-base", "");
    webAppContainer.appendChild(webAppAvatarBase);
  }

  const avatarPageContainer = document.createElement("div");
  avatarPageContainer.setAttribute("id", "avatar-react-container");
  webAppContainer?.appendChild(avatarPageContainer);

  // Render the React component
  renderAvatarReactComponent();
}
