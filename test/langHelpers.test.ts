import { TRoute } from "../src";
import { getLangPathByPath } from "../src/lang/langHelpers";

export const routesList: TRoute[] = [
  {
    path: { en: "/home", fr: "/accueil", de: "/zuhause" },
    component: null,
    name: "home",
  },
  { path: "/news", component: null, name: "news" },
  {
    path: { en: "/about", fr: "/a-propos", de: "uber" },
    //path: { en: "/about", fr: "/a-propos", de: "uber" },
    name: "about",
    component: null,
    children: [
      {
        //path: "/foo-en",
        path: { en: "/foo-en", fr: "/foo-fr", de: "foo-de" },
        name: "foo",
        component: null,
      },
      { path: "/bar", component: null, name: "bar" },
    ],
  },
];

describe("langHelpers", () => {
  // FIXME REMOVE ONLY
  it("getLangPathByPath: get path router + subrouter string as param, should return path properly", () => {
    const alternatePath = getLangPathByPath({
      path: "/foo-fr",
      base: "/a-propos",
      lang: "en",
      routes: routesList
    });
    expect(alternatePath).toBe("/about/foo-en");
  });

  it.only("getLangPathByPath: should return path if current path is string", () => {
    const testRoute = routesList.find((el) => el.name === "news");
    const path = testRoute.path;
    const alternatePath = getLangPathByPath({
      path: path,
      base: "/",
      lang: "de",
      routes: routesList
    });
    expect(alternatePath).toBe(testRoute.path);
  });

  it("getLangPathByPath: get path string as param, should return path properly", () => {
    const testRoute = routesList.find((el) => el.name === "home");
    const path: string = testRoute.path;
    const alternatePath = getLangPathByPath({
      path: path,
      base: "/",
      lang: "de",
      routes: routesList
    });
    expect(alternatePath).toBe(testRoute?.path?.de);
  });

  it("getLangPathByPath: get path object as param, should return path properly", () => {
    const testRoute = routesList.find((el) => el.name === "home");
    const path: { [x: string]: string } = testRoute.path;
    const alternatePath = getLangPathByPath({
      path: path,
      base: "/",
      lang: "de",
      routes: routesList
    });
    expect(alternatePath).toBe(testRoute?.path?.de);
  });
});
