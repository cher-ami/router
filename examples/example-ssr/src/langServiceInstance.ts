import { languages, showDefaultLangInUrl } from "./languages"
import { LangService } from "@cher-ami/router"

export const langServiceInstance = (base = "/", url = window.location.pathname) =>
  new LangService({
    showDefaultLangInUrl,
    staticLocation: url,
    languages,
    base,
  })
