import * as React from "react";
import * as JSX from "react/jsx-runtime";
import * as JSXDev from "react/jsx-dev-runtime";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import * as ReactDOM from "react-dom";
import * as ReactDOMServer from "react-dom/server";
import * as Redux from "redux";
import * as ReactRedux from "react-redux";
import * as ReduxThunk from "redux-thunk";
import * as ReactRouter from "react-router";
import * as ReactRouterDOM from "react-router-dom";
import * as PropTypes from "prop-types";
import * as TanstackQuery from "@tanstack/react-query";
import { addExternal } from "@rbx/externals";

addExternal("React", { ...React });
addExternal("ReactJSX", { ...JSX });
addExternal("ReactJSXDev", JSXDev);
addExternal("ReactDOM", ReactDOM);
addExternal("ReactDOMServer", ReactDOMServer);
addExternal("ReactRedux", ReactRedux);
addExternal("ReactRouter", ReactRouter);
addExternal("ReactRouterDOM", ReactRouterDOM);
addExternal("Redux", Redux);
addExternal("ReduxThunk", ReduxThunk);
addExternal("PropTypes", PropTypes);
addExternal("TanstackQuery", TanstackQuery);
