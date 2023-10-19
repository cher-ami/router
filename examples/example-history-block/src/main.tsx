import ReactDOM from "react-dom/client"
import { App } from "./App.tsx"
import "./index.css"
import { LangService, Router } from "@cher-ami/router"
import { createBrowserHistory } from "history"
import { forwardRef } from "react"

const base = "/base/"
type TLang = "en" | "fr" | "de"

const langService = new LangService<TLang>({
  languages: [{ key: "en" }, { key: "fr" }, { key: "de" }],
  showDefaultLangInUrl: false,
  base,
})

const routesList = [
  {
    path: "/a",
    component: forwardRef((_, ref: any) => <div ref={ref}>A</div>),
  },
  {
    path: "/b",
    component: forwardRef((_, ref: any) => <div ref={ref}>B</div>),
  },
]

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Router
    history={createBrowserHistory()}
    langService={langService}
    routes={routesList}
    base={base}
  >
    <App />
  </Router>,
)
