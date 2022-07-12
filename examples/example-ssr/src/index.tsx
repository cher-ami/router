import React from "react";
import { hydrateRoot } from "react-dom/client";
import { App } from "./components/App";
import { routes } from "./routes";
import { createBrowserHistory } from "history";
import "./index.css";
import { LangService, Router } from "@cher-ami/router";
import { GlobalDataContext } from "./GlobalDataContext";
import languages from "./languages";

const langService = new LangService({
  languages,
});

/**
 * Client side
 */
const root = hydrateRoot(
  document.getElementById("root"),
  <Router
    routes={routes}
    history={createBrowserHistory()}
    initialStaticProps={window["__SSR_STATIC_PROPS__"]}
    langService={langService}
  >
    <GlobalDataContext.Provider value={{ globalData: window["__GLOBAL_DATA__"] }}>
      <App />
    </GlobalDataContext.Provider>
  </Router>
);
