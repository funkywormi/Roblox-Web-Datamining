import React from "react";
import LoginLegacyView from "./LoginLegacyView";
import type { LoginControllerViewModel } from "../types/loginControllerTypes";

export type LoginPresentationRouterProps = {
  viewModel: LoginControllerViewModel;
  isLoginRefreshEnabled: boolean;
  renderRefreshedLogin?: (viewModel: LoginControllerViewModel) => React.JSX.Element;
};

const LoginPresentationRouter = ({
  viewModel,
  isLoginRefreshEnabled,
  renderRefreshedLogin,
}: LoginPresentationRouterProps): React.JSX.Element => {
  if (isLoginRefreshEnabled && renderRefreshedLogin) {
    return renderRefreshedLogin(viewModel);
  }

  return <LoginLegacyView viewModel={viewModel} />;
};

export default LoginPresentationRouter;
