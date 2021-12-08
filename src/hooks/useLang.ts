import LangService, { TLanguage } from "../core/LangService";
import debug from "@wbe/debug";
import React from "react";
import { Routers } from "../core/Routers";
import { useHistory } from "..";
const log = debug("router:useLang");

/**
 * useLang
 */
export const useLang = (
  langService: LangService = Routers.langService
): [lang: TLanguage, setLang: (lang: TLanguage | string, force: boolean) => void] => {
  const [lang, setLang] = React.useState<TLanguage>(langService.currentLang);

  // each time history change, set the current language in state
  useHistory(() => {
    setLang(langService.currentLang);
  }, []);

  // Prepare setLocation function, who push in history
  function setNewLang(lang: TLanguage | string, force = true): void {
    let langToPush;
    if (typeof lang === "string") {
      langToPush = langService.languages.find((el) => el.key === lang);
    } else {
      langToPush = lang;
    }
    langService.setLang(langToPush, force);
  }

  return [lang, setNewLang];
};
