import React from "react";
import { Provider } from "react-redux";
import { store } from "../../../redux/store";

const ReduxStoreProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxStoreProvider;
