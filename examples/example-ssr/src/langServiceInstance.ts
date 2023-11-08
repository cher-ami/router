import { languages, showDefaultLangInUrl } from "./languages"
import { LangService } from "@cher-ami/router"

export const langServiceInstance = (
  base = import.meta.env.VITE_APP_BASE || "/",
  url = window.location.pathname,
) =>
  new LangService({
    showDefaultLangInUrl,
    staticLocation: url,
    languages,
    base,
  })
