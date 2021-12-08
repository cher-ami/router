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
): [lang: TLanguage, setLang: (lang: TLanguage, force: boolean) => void] => {
  const [lang, setLang] = React.useState(langService.currentLang);

  useHistory(() => {
    setLang(langService.currentLang);
    log("lang", lang);
  }, []);

  // Prepare setLocation function, who push in history
  function setNewLang(lang: TLanguage, force = true): void {
    langService.setLang(lang, force);
  }

  return [lang, setNewLang];
};
