import LangService from "../src";

const locales = [{ key: "en" }, { key: "fr" }, { key: "de" }];

describe("LangService", () => {
  it("should turn init to true after init", () => {
    LangService.init(locales);
    expect(LangService.isInit).toBe(true);
  });

  it("should show default lang in URL", () => {
    LangService.init(locales, true);
  });

  it("should hide default lang in URL", () => {
    LangService.init(locales, false);
  });

  it("setLang should process window.open", () => {
  //   LangService.init([{ key: "en" }], true);
  //   expect(LangService.isInit).toBe(true);
  });
});
