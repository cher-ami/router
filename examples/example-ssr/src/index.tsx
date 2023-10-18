import React from "react";
import { hydrateRoot } from "react-dom/client";
import { App } from "./components/App";
import { routes } from "./routes";
import { createBrowserHistory } from "history";
import "./index.css";
import { Router } from "@cher-ami/router";
import { langServiceInstance } from "./langServiceInstance";
import { GlobalDataContext } from "~/store/GlobalDataContext";

/**
 * Client side
 */
hydrateRoot(
  document.getElementById("root"),
  <Router
    routes={routes}
    history={createBrowserHistory()}
    initialStaticProps={window["__SSR_STATIC_PROPS__"]}
    langService={langServiceInstance()}
  >
    <GlobalDataContext.Provider value={window["__GLOBAL_DATA__"]}>
      <App />
    </GlobalDataContext.Provider>
  </Router>,
);
