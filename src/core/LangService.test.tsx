import React from "react";
import { Router } from "../components/Router";
import LangService from "../core/LangService";
import { Link } from "../components/Link";
import { act, render } from "@testing-library/react";
import { TRoute } from "../components/Router";

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

/**
 * setLang
 * FIXME can't test because setLang use "prepareFullUrl()" which use Routers property not setted
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

// -------------------------------------------------------------------------------------

/**
 * Add lang path param allows to test the same array before and after middleware
 * The method added langPath param even if it doesn't patch all routes
 * @param addLangPath
 */

const routesListLang: TRoute[] = [
  {
    path: "/",
    langPath: null,
  },
  {
    path: "/hello",
    langPath: null,
    children: [
      { path: { en: "/zoo-en", fr: "/zoo-fr", de: "zoo-de" }, langPath: null },
      { path: "/:id", langPath: null },
    ],
  },
];

const patchedRoutesListLang: TRoute[] = [
  {
    path: "/:lang",
    langPath: { en: "/:lang", fr: "/:lang", de: "/:lang" },
  },
  {
    path: "/:lang/hello",
    langPath: { en: "/:lang/hello", fr: "/:lang/hello", de: "/:lang/hello" },
    children: [
      {
        path: "/zoo-en",
        langPath: { en: "/zoo-en", fr: "/zoo-fr", de: "zoo-de" },
      },
      { path: "/:id", langPath: { en: "/:id", fr: "/:id", de: "/:id" } },
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
