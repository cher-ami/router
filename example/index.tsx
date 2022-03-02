import ReactDOM from "react-dom";
import React from "react";
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

ReactDOM.render(
  <Router
    history={createBrowserHistory()}
    //staticLocation="/base/en/about"
    langService={langService}
    routes={routesList}
    base={base}
  >
    <App />
  </Router>,
  document.getElementById("root")
);
