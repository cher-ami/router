import { createRoot } from "react-dom/client"
import React from "react"
import "./index.css"
import App from "./App"
import { Router, LangService } from "@cher-ami/router"
import { routesList } from "./routes"
import { createBrowserHistory, createHashHistory } from "history"

const base = "/"
type TLang = "en" | "fr" | "de"

const history = createBrowserHistory()
const isHashHistory = false

const langService = new LangService<TLang>({
  languages: [{ key: "en" }, { key: "fr" }, { key: "de" }],
  showDefaultLangInUrl: false,
  base,
  isHashHistory,
})

// const history = createHashHistory()
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
