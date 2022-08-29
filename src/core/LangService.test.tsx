import React from "react";
import { Router } from "../components/Router";
import LangService from "../core/LangService";
import { Link } from "../components/Link";
import { act, render } from "@testing-library/react";
import { TRoute } from "../components/Router";
import { createBrowserHistory } from "history";

const locales = [{ key: "en" }, { key: "fr" }, { key: "de" }];
const routesList: TRoute[] = [
  { path: "/", name: "home" },
  { path: "/foo", name: "foo" },
];

const mockClickHandler = jest.fn();
const App = ({ base = "/", to = "/foo", langService }) => {
  return (
    <Router
      base={base}
      routes={routesList}
      langService={langService}
      history={createBrowserHistory()}
    >
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

/**
 * redirect
 *
 *
 */
it("should redirect to default lang", () => {
  const langService = new LangService({ languages: locales, base: "/" });
  render(<App langService={langService} />);
  act(() => {
    langService.redirect(true);
  });
  const defaultLangKey = langService.defaultLang.key;
  expect(window.open).toHaveBeenCalledWith(`/${defaultLangKey}`, "_self");
});

it("should redirect to default lang with custom base", () => {
  const langService = new LangService({ languages: locales, base: "/" });
  render(<App base={"/foo-base"} langService={langService} />);
  act(() => {
    langService.redirect(true);
  });
  const defaultLangKey = langService.defaultLang.key;
  expect(window.open).toHaveBeenCalledWith(`/${defaultLangKey}`, "_self");
});

it("should not redirect to default lang if showDefaultLangInUrl is set to false", () => {
  const langService = new LangService({
    languages: locales,
    base: "/",
    showDefaultLangInUrl: false,
  });
  render(<App langService={langService} />);
  act(() => {
    langService.redirect(true);
  });
  expect(window.open).toHaveBeenCalledTimes(0);
});


/**
 * Add lang path param allows to test the same array before and after middleware
 * The method added langPath param even if it doesn't patch all routes
 * @param addLangPath
 *
 *
 *
 */
const routesListLang: TRoute[] = [
  {
    path: "/",
  },
  {
    path: "/hello",
    children: [
      { path: { en: "/zoo-en", fr: "/zoo-fr", de: "zoo-de" }, _langPath: null },
      { path: "/:id", },
    ],
  },
];

const patchedRoutesListLang: TRoute[] = [
  {
    path: "/:lang",
    _langPath: { en: "/:lang", fr: "/:lang", de: "/:lang" },
  },
  {
    path: "/:lang/hello",
    _langPath: { en: "/:lang/hello", fr: "/:lang/hello", de: "/:lang/hello" },
    children: [
      {
        path: "/zoo-en",
        _langPath: { en: "/zoo-en", fr: "/zoo-fr", de: "zoo-de" },
      },
      { path: "/:id", _langPath: { en: "/:id", fr: "/:id", de: "/:id" } },
    ],
  },
];

describe("addLangParamToRoutes", () => {
  const langService = new LangService({ languages: locales, base: "/" });
  it("should patch all first level routes if LangService is init", () => {
    expect(langService.addLangParamToRoutes(routesListLang, true)).toEqual(
      patchedRoutesListLang
    );
  });
});
