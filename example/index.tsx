import ReactDOM from "react-dom";
import * as React from "react";
import { forwardRef } from "react";
import { Router, TRoute } from "../src";

import App from "./App";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import "./index.css";
import ArticlePage from "./pages/ArticlePage";
import FooPage from "./pages/FooPage";
import BarPage from "./pages/BarPage";
import { createHashHistory } from "history";

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

/**
 * Init Application
 */
ReactDOM.render(
  <Router routes={routesList} base={"/"} history={createHashHistory()}>
    <App />
  </Router>,
  document.getElementById("root")
);
