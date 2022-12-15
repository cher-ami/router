import languages from "./languages";
import { LangService } from "@cher-ami/router";

export const langServiceInstance = (base = "/", url = window.location.pathname) =>
  new LangService({
    showDefaultLangInUrl: true,
    staticLocation: url,
    languages,
    base,
  });

