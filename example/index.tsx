import ReactDOM from "react-dom";
import React from "react";
import "./index.css";
import App from "./App";
import { Router } from "../src/components/Router";
import { routesList } from "./routes";
import { LangService, langMiddleware } from "../src";
import { createMemoryHistory } from "history";

const baseUrl = "/base/";
// LangService.init([{ key: "en" }, { key: "fr" }, { key: "de" }], true, baseUrl);

/**
 * Init Application
 */
ReactDOM.render(
  <Router routes={routesList} base={baseUrl}>
    <App />
  </Router>,
  document.getElementById("root")
);
