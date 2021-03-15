import ReactDOM from "react-dom";
import * as React from "react";
import { forwardRef } from "react";
import { EHistoryMode, Router, TRoute } from "../src";
import LanguagesService from "../src/languages/LanguagesService";
import { languagesMiddleware } from "../src/languages/LanguagesMiddleware";

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

// prettier-ignore
const locales = [
  { key: "en" },
  { key: "fr" },
  { key: "de" }
];

LanguagesService.init(locales);

/**
 * Init Application
 */
ReactDOM.render(
  <Router
    routes={routesList}
    base={"/coucou"}
    middlewares={[languagesMiddleware]}
    historyMode={EHistoryMode.BROWSER}
  >
    <App />
  </Router>,
  document.getElementById("root")
);
