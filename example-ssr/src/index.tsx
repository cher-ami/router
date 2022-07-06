import React, {createContext} from "react"
import { hydrateRoot } from "react-dom/client";
import { App } from "./components/App";
import { routes } from "./routes";
import { createBrowserHistory } from "history";
import "./index.css";
import { Router } from "../../src";


const globalData = window["__GLOBAL_DATA__"]

const GlobalContext = createContext(globalData)

const root = hydrateRoot(
  document.getElementById("root"),
  // le fichier JS qui sera importé dans une balise script dans le fichier index.html
  <Router routes={routes} history={createBrowserHistory()} staticProps={window["__SSR_STATIC_PROPS__"]}>
    <App />
  </Router>
);
