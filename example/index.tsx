import ReactDOM from "react-dom";
import * as React from "react";
import { forwardRef } from "react";
import { Router } from "../src";
import { LangService, langMiddleware } from "../src";

import App from "./App";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ArticlePage from "./pages/ArticlePage";
import FooPage from "./pages/FooPage";
import BarPage from "./pages/BarPage";
import "./index.css";
import { createBrowserHistory } from "history";
import { TRoute } from "../src/components/Router";

/**
 * Define routes list
 */
export const routesList: TRoute[] = [
  {
    path: "/",
    // path: { en: "/", fr: "/", de: "/" },
    component: HomePage,
  },
  {
    path: "/blog/:id",
    //path: { en: "/blog/:id", fr: "/blog-fr/:id", de: "/blog-de/:id" },
    component: ArticlePage,
    props: {
      color: "red",
    },
  },
  {
    path: "/about",
    //path: { en: "/about", fr: "/a-propos", de: "/uber" },
    component: AboutPage,
    // children: [
    //   {
    //     path: "/foo",
    //     // path: { en: "/foo", fr: "/foo-fr", de: "/foo-de" },
    //     component: FooPage,
    //   },
    //   {
    //     path: "/bar",
    //     component: BarPage,
    //   },
    // ],
  },
  {
    path: "/:rest",
    component: forwardRef((props, r) => <div className="NotFoundPage">Not Found</div>),
  },
];

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
