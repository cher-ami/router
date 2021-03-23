/**
 * UseSetLang
 * @param langKey
 */
import { LangService, TLanguage } from "..";

export const useLang = (): [TLanguage, (lang: string) => void] => {
  if (!LangService.isInit) return;
  return [LangService.currentLang, (pLang) => LangService.setLang({ key: pLang })];
};
