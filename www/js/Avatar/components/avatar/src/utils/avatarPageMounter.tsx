import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import AvatarPageContainer from "../containers/AvatarPageContainer";

/** *****************************************************************************
 NOTE:
   These mounting functions should only be used if you aren't using React.
   Otherwise, you should render the AvatarPage directly within your app.
****************************************************************************** */

function renderApp() {
  const entryPoint = document.getElementById("avatar-react-container");

  if (entryPoint) {
    render(<AvatarPageContainer />, entryPoint);
  } else {
    // Recursively call renderApp if target div not found
    // Callback will be triggered before every repaint
    window.requestAnimationFrame(() => {
      renderApp();
    });
  }
}

/*
Tries to mount and render the AvatarPage React component.
*/
function renderAvatarReactComponent(): void {
  renderApp();
}

export function unmountAvatarReactComponent(): void {
  const container = document.getElementById("avatar-react-page");
  if (container) {
    unmountComponentAtNode(container);
  }
}

export default renderAvatarReactComponent;
