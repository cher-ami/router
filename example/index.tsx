import ReactDOM from "react-dom";
import * as React from "react";
import { forwardRef } from "react";
import { Router, TRoute } from "../src";

import App from "./App";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ArticlePage from "./pages/ArticlePage";
import FooPage from "./pages/FooPage";
import BarPage from "./pages/BarPage";
import "./index.css";
import { EHistoryMode } from "../src";

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

// Language
// Language.service() -> singleton / store
// Language.middleware() -> fonction static qui permet de patcher les routes et faire du traitement

// const monMiddleware = Langage.getMiddleware("FR")

// getMiddleware(options) {
//   return (routes, currentoute) => {
//     options
//   }
// }

/**
 * Init Application
 */

ReactDOM.render(
  <Router routes={routesList} base={"/"} historyMode={EHistoryMode.BROWSER}>
    <App />
  </Router>,
  document.getElementById("root")
);
