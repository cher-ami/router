import LangService, { TLanguage } from "../core/LangService"
import debug from "@cher-ami/debug"
import React from "react"
import { ROUTERS } from "../core/ROUTERS"
import { useHistory } from "../hooks/useHistory"
const log = debug("router:useLang")

/**
 * useLang
 */
export const useLang = (
  langService: LangService = ROUTERS.langService,
): [lang: TLanguage, setLang: (lang: TLanguage | string, force: boolean) => void] => {
  const [lang, setLang] = React.useState<TLanguage>(langService?.currentLang)

  // each time history change, set the current language in state
  useHistory(() => {
    if (!langService) {
      console.warn(
        `useLang - LangService isn't init. You need to create a LangService instance before using this hook. https://github.com/cher-ami/router/tree/main#LangService`,
      )
      return
    }
    setLang(langService.currentLang)
  }, [])

  // Prepare setLocation function, who push in history
  function setNewLang(lang: TLanguage | string, force = true): void {
    let langToPush
    if (typeof lang === "string") {
      langToPush = langService.languages.find((el) => el.key === lang)
    } else {
      langToPush = lang
    }
    langService.setLang(langToPush, force)
  }

  return [lang, setNewLang]
}
