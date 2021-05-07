import ReactDOM from "react-dom";
import * as React from "react";
import { forwardRef } from "react";
import { EHistoryMode, Router, TRoute } from "../src";
import { LangService, langMiddleware } from "../src";

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
    path: { en: "/", fr: "/", de: "/" },
    component: HomePage,
  },
  {
    path: { en: "/blog/:id", fr: "/blog-fr/:id", de: "/blog-de/:id" },
    component: ArticlePage,
    props: {
      color: "red",
    },
  },
  {
    path: { en: "/about", fr: "/a-propos", de: "/uber" },
    component: AboutPage,
    children: [
      {
        path: { en: "/foo", fr: "/foo-fr", de: "/foo-de" },
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

const baseUrl = "/custom-base";
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
