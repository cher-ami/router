import ReactDOM from "react-dom";
import * as React from "react";
import { forwardRef } from "react";
import { EHistoryMode, Router, TRoute } from "../src";
import LangService from "../src/languages/LangService";
import { langMiddleware } from "../src/languages/LangMiddleware";

import App from "./App";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ArticlePage from "./pages/ArticlePage";
import FooPage from "./pages/FooPage";
import BarPage from "./pages/BarPage";
import "./index.css";

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
    props: {
      color: "red",
    },
  },
  {
    path: "/about",
    component: AboutPage,
    children: [
      {
        path: "/foo",
        component: FooPage,
      },
      {
        path: "/bar",
        component: BarPage,
      },
    ],
  },
  {
    path: "/:rest",
    component: forwardRef((props, r) => <div className="NotFoundPage">Not Found</div>),
  },
];

const baseUrl = "/master";
const locales = [{ key: "en" }, { key: "fr" }, { key: "de" }];
LangService.init(locales, false, baseUrl);

/**
 * Init Application
 */
ReactDOM.render(
  <Router
    routes={routesList}
    base={baseUrl}
    middlewares={[langMiddleware]}
    historyMode={EHistoryMode.BROWSER}
  >
    <App />
  </Router>,
  document.getElementById("root")
);
