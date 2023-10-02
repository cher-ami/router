import languages from "./languages";
import { LangService } from "@cher-ami/router";

export const langServiceInstance = (base = "/", url = window.location.pathname) =>
  new LangService({
    showDefaultLangInUrl: false,
    staticLocation: url,
    languages,
    base,
  });

