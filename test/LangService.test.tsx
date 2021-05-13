import { LangService, langMiddleware, Link, Router, TRoute } from "../src";
import { act, render } from "@testing-library/react";
import React from "react";

const locales = [{ key: "en" }, { key: "fr" }, { key: "de" }];
const routesList: TRoute[] = [
  { path: "/", name: "home" },
  { path: "/foo", name: "foo" },
];

const mockClickHandler = jest.fn();
const App = ({ base = "/", to = "/foo" }) => {
  return (
    <Router base={base} routes={routesList} middlewares={[langMiddleware]}>
      <Link
        to={to}
        className={"containerLink"}
        onClick={mockClickHandler}
        children={"foo"}
      />
    </Router>
  );
};

const windowOpenMock = jest.fn();

beforeAll(() => {
  const location = window.location;
  delete global.window.location;
  global.window.location = Object.assign({}, location);
  global.window.open = windowOpenMock;
});

afterEach(() => {
  windowOpenMock.mockClear();
});

describe("LangService", () => {
  it("should turn isInit property to true after init", () => {
    LangService.init(locales);
    expect(LangService.isInit).toBe(true);
  });

  /**
   * setLang
   */
  it("should set lang properly", () => {
    LangService.init(locales, false);
    render(<App />);
    act(() => LangService.setLang(locales[1]));
    expect(window.open).toHaveBeenCalledWith(`/${locales[1].key}`, "_self");
  });

  it("should set lang properly with showDefaultLangInUrl set to false and with window.open", () => {
    LangService.init(locales, false);
    render(<App />);
    act(() => {
      LangService.setLang(locales[1]);
    });
    expect(window.open).toHaveBeenCalledWith(`/${locales[1].key}`, "_self");
  });

  /**
   * redirect
   */
  it("should redirect to default lang", () => {
    LangService.init(locales, true);
    render(<App />);
    act(() => {
      LangService.redirect(true);
    });
    const defaultLangKey = LangService.defaultLang.key;
    expect(window.open).toHaveBeenCalledWith(`/${defaultLangKey}`, "_self");
  });

  it("should redirect to default lang with custom base", async () => {
    LangService.init(locales, true);
    render(<App base={"/foo-base"} />);
    act(() => {
      LangService.redirect(true);
    });
    const defaultLangKey = LangService.defaultLang.key;
    expect(window.open).toHaveBeenCalledWith(`/${defaultLangKey}`, "_self");
  });

  it("should not redirect to default lang if showDefaultLangInUrl is set to false", () => {
    LangService.init(locales, false);
    render(<App />);
    act(() => {
      LangService.redirect(true);
    });
    expect(window.open).toHaveBeenCalledTimes(0);
  });
});
