import ReactDOM from "react-dom";
import * as React from "react";
import { forwardRef } from "react";
import { Router, TRoute } from "../src";

import App from "./App";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import "./index.css";
import ArticlePage from "./pages/ArticlePage";

const debug = require("debug")(`router:index`);

/**
 * Define routes list
 */
export const routesList: TRoute[] = [
  {
    path: "/",
    component: HomePage,
  },
  {
    path: "/blog/:id",
    component: ArticlePage,
  },
  {
    path: "/about",
    component: AboutPage,
  },
  {
    path: "/:rest",
    component: forwardRef((props, r) => <div className="NotFoundPage">Not Found</div>),
  },
];

// const baseUrl = "/master";
// const locales = [{ key: "en" }, { key: "fr" }, { key: "de" }];
//
// LangService.init(locales, true, baseUrl);

/**
 * Init Application
 */
ReactDOM.render(
  <Router routes={routesList} base={"/"}>
    <App />
  </Router>,
  document.getElementById("root")
);
