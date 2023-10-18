import { TLanguage } from "@cher-ami/router";

/**
 * Available languages
 * list of available languages
 */
export const languages: TLanguage[] = [
  {
    key: "fr",
    default: true,
  },
  {
    key: "en",
  },
];

/**
 * Show default lang in URL
 * Common configuration between server and client
 */
export const showDefaultLangInUrl = false;
