import React from "react";
import { hydrateRoot } from "react-dom/client";
import { App } from "./components/App";
import { routes } from "./routes";
import { createBrowserHistory } from "history";
import "./index.css";
import { Router } from "../../src";


// const routesWithCurrentRouteSurchargeParWindowObj = routes.find(e => e.name === "home")
// Object.assign(routesWithCurrentRouteSurchargeParWindowObj.props, window["__SSR_STATIC_PROPS__"])

// console.log("window[\"__SSR_STATIC_PROPS__\"]" , window["__SSR_STATIC_PROPS__"])

const root = hydrateRoot(
  document.getElementById("root"),
  // le fichier JS qui sera importé dans une balise script dans le fichier index.html
  <Router routes={routes} history={createBrowserHistory()} staticProps={window["__SSR_STATIC_PROPS__"]}>
    <App />
  </Router>
);
