import { LangService, Link, Router, Routers, useRouter } from "../src";
import { act, render } from "@testing-library/react";
import React from "react";
import { TRoute } from "../src/components/Router";

const locales = [{ key: "en" }, { key: "fr" }, { key: "de" }];
const routesList: TRoute[] = [
  { path: "/", name: "home" },
  { path: "/foo", name: "foo" },
];

const mockClickHandler = jest.fn();
const App = ({ base = "/", to = "/foo", langService }) => {
  return (
    <Router base={base} routes={routesList} langService={langService}>
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
 * setLang
 * TODO can't test because setLang use "prepareFullUrl()" which use Routers property not setted
 */

// it("should set lang properly", () => {
//   const langService = new LangService({ languages: locales, base: "/" });
//   render(<App langService={langService} />);
//   act(() => {
//     console.log("Routers", Routers.currentRoutes);
//     Routers.langService.setLang(locales[1]);
//   });
//   expect(window.open).toHaveBeenCalledWith(`/${locales[1].key}`, "_self");
// });

/**
 * redirect
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

// -------------------------------------------------------------------------------------

/**
 * Add lang path param allows to test the same array before and after middleware
 * The method added langPath param even if it doesn't patch all routes
 * @param addLangPath
 */

const routesListLang = (addLangPath = false): TRoute[] => [
  {
    path: "/",
    ...(addLangPath ? { langPath: null } : {}),
  },
  {
    path: "/hello",
    ...(addLangPath ? { langPath: null } : {}),
    children: [
      { path: "/zoo", ...(addLangPath ? { langPath: null } : {}) },
      { path: "/:id", ...(addLangPath ? { langPath: null } : {}) },
    ],
  },
];

const patchedRoutesListLang: TRoute[] = [
  {
    path: "/:lang",
    langPath: null,
  },
  {
    path: "/:lang/hello",
    langPath: null,
    children: [
      { path: "/zoo", langPath: null },
      { path: "/:id", langPath: null },
    ],
  },
];

describe("addLangParamToRoutes", () => {
  const langService = new LangService({ languages: locales, base: "/" });
  it("should patch all first level routes if LangService is init", () => {
    expect(langService.addLangParamToRoutes(routesListLang(), true)).toEqual(
      patchedRoutesListLang
    );
  });
  it("should not patch routes if LangService is not init", () => {
    expect(langService.addLangParamToRoutes(routesListLang(), false)).toEqual(
      routesListLang(true)
    );
  });
});
