import { LangService, Link, Router } from "../src";
import { act, render } from "@testing-library/react";
import React from "react";
import { TRoute } from "../src/components/Router";

const locales = [{ key: "en" }, { key: "fr" }, { key: "de" }];
const routesList: TRoute[] = [
  { path: "/", name: "home" },
  { path: "/foo", name: "foo" },
];

const mockClickHandler = jest.fn();
const App = ({ base = "/", to = "/foo" }) => {
  

  return (
    <Router base={base} routes={routesList}>
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

// describe("LangService", () => {
//   it("should turn isInit property to true after init", () => {
//     LangService.init(locales);
//     expect(LangService.isInit).toBe(true);
//   });

//   /**
//    * setLang
//    */
//   it("should set lang properly", () => {
//     LangService.init(locales, false);
//     render(<App />);
//     act(() => LangService.setLang(locales[1]));
//     expect(window.open).toHaveBeenCalledWith(`/${locales[1].key}`, "_self");
//   });

//   /**
//    * redirect
//    */
//   it("should redirect to default lang", () => {
//     LangService.init(locales, true);
//     render(<App />);
//     act(() => {
//       LangService.redirect(true);
//     });
//     const defaultLangKey = LangService.defaultLang.key;
//     expect(window.open).toHaveBeenCalledWith(`/${defaultLangKey}`, "_self");
//   });

//   it("should redirect to default lang with custom base", () => {
//     LangService.init(locales, true);
//     render(<App base={"/foo-base"} />);
//     act(() => {
//       LangService.redirect(true);
//     });
//     const defaultLangKey = LangService.defaultLang.key;
//     expect(window.open).toHaveBeenCalledWith(`/${defaultLangKey}`, "_self");
//   });

//   it("should not redirect to default lang if showDefaultLangInUrl is set to false", () => {
//     LangService.init(locales, false);
//     render(<App />);
//     act(() => {
//       LangService.redirect(true);
//     });
//     expect(window.open).toHaveBeenCalledTimes(0);
//   });
// });


/**
 * Add lang path param allows to test the same array before and after middleware
 * The middleware added langPath param even if it doesn't patch all routes
 * @param addLangPath
 */

// const routesList = (addLangPath = false): TRoute[] => [
//   {
//     path: "/",
//     ...(addLangPath ? { langPath: null } : {}),
//   },
//   {
//     path: "/hello",
//     ...(addLangPath ? { langPath: null } : {}),
//     children: [
//       { path: "/zoo", ...(addLangPath ? { langPath: null } : {}) },
//       { path: "/:id", ...(addLangPath ? { langPath: null } : {}) },
//     ],
//   },
// ];

// const patchRoutesList: TRoute[] = [
//   {
//     path: "/:lang",
//     langPath: null,
//   },
//   {
//     path: "/:lang/hello",
//     langPath: null,
//     children: [
//       { path: "/zoo", langPath: null },
//       { path: "/:id", langPath: null },
//     ],
//   },
// ];

// FIXME
// describe("LangMiddleware", () => {
//   LangService.init([{ key: "fr" }, { key: "en" }], true);
//   it("should patch all first level routes if LangService is init", () => {
//     expect(langMiddleware(routesList(), true)).toEqual(patchRoutesList);
//   });

//   it("should not patch routes if LangService is not init", () => {
//     expect(langMiddleware(routesList(), false)).toEqual(routesList(true));
//   });
// });