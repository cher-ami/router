import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";
import App from "./App";
import { Router, LangService } from "@cher-ami/router";
import { routesList } from "./routes";
import { createBrowserHistory } from "history";

const base = "/base/";
type TLang = "en" | "fr" | "de";

const langService = new LangService<TLang>({
  languages: [{ key: "en" }, { key: "fr" }, { key: "de" }],
  showDefaultLangInUrl: false,
  base,
});

/**
 * Init Application
 */
const root = createRoot(document.getElementById("root"));

root.render(
  <Router
    history={createBrowserHistory()}
    langService={langService}
    routes={routesList}
    base={base}
  >
    <App />
  </Router>
);
