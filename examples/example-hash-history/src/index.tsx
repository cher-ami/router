import { createRoot } from "react-dom/client"
import React from "react"
import "./index.css"
import App from "./App"
import { Router, LangService } from "@cher-ami/router"
import { routesList } from "./routes"
import { createBrowserHistory, createHashHistory } from "history"

const base = "/base/"
type TLang = "en" | "fr" | "de"

const isHashHistory = true
const history = createHashHistory()

const langService = new LangService<TLang>({
  languages: [{ key: "en" }, { key: "fr" }, { key: "de" }],
  showDefaultLangInUrl: false,
  base,
  isHashHistory,
})

/**
 * Init Application
 */
const root = createRoot(document.getElementById("root"))

root.render(
  <Router
    history={history}
    langService={langService}
    isHashHistory={isHashHistory}
    routes={routesList}
    base={base}
  >
    <App />
  </Router>,
)
