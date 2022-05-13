import { createRoot } from "react-dom/client";
import React, { StrictMode } from "react";
import "./index.css";
import App from "./App";
import { Router } from "../src/components/Router";
import { routesList } from "./routes";
import { LangService } from "../src";
import { createBrowserHistory } from "history";

const base = "/base/";
type TLang = "en" | "fr" | "de";

const langService = new LangService<TLang>({
  languages: [{ key: "en" }, { key: "fr" }, { key: "de" }],
  showDefaultLangInUrl: true,
  base,
});

/**
 * Init Application
 */
const root = createRoot(document.getElementById("root"));

root.render(
  
  <Router
    history={createBrowserHistory()}
    //staticLocation="/base/en/about"
    langService={langService}
    routes={routesList}
    base={base}
  >
    <App />
  </Router>
  
);
