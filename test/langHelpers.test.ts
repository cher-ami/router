import { TRoute } from "../src";
import { getLangPathByPath } from "../src/lang/langHelpers";

export const routesList: TRoute[] = [
  {
    path: { en: "/home", fr: "/accueil", de: "/zuhause" },
    name: "home",
  },
  { path: "/news", name: "news" },
  {
    path: { en: "/about", fr: "/a-propos", de: "uber" },
    name: "about",

    children: [
      {
        path: { en: "/foo-en", fr: "/foo-fr", de: "foo-de" },
        name: "foo",
      },
      { path: "/bar", name: "bar" },
    ],
  },
];

describe("langHelpers", () => {
  it("getLangPathByPath: get path router + subrouter string as param, should return path properly", () => {
    const routes = [
      {
        path: "/home",
        children: [{ path: "/zoo" }],
      },
      {
        path: "/foo/bar",
        children: [{ path: "/foo2" }],
      },
      {
        path: "/ok/bar",
        children: [{ path: "/foo2" }],
      },
    ];
    //prettier-ignore
    expect(getLangPathByPath({ path: "/home", lang: "fr", routes }))
      .toBe("/home");
    // prettier-ignore
    expect(getLangPathByPath({ path: "/home/zoo", base: "/home", routes }))
      .toBe("/home/zoo");
    //prettier-ignore
    expect(getLangPathByPath({ path: "/ok/bar/foo2", base: "/ok/bar", routes }))
      .toBe("/ok/bar/foo2");
  });

  it("getLangPathByPath: get path router + subrouter object as param, should return path properly", () => {
    const routes = [
      {
        path: { en: "/home", fr: "/accueil", de: "/zuhause" },
        children: [
          {
            path: { en: "/foo-en", fr: "/foo-fr", de: "/foo-de" },
          },
        ],
      },
    ];
    // prettier-ignore
    expect(getLangPathByPath({ path: "/accueil/foo-fr", base: "/accueil", lang: "en", routes }))
      .toBe("/home/foo-en");
    // prettier-ignore
    expect(getLangPathByPath({ path: "/zuhause/foo-de", base: "/zuhause", lang: "en", routes }))
      .toBe("/home/foo-en");
  });

  it("getLangPathByPath: should return path if current path is string", () => {
    const testRoute = routesList.find((el) => el.name === "news");
    const path = testRoute.path;
    expect(
      getLangPathByPath({
        path: path,
        lang: "de",
        routes: routesList,
      })
    ).toBe(path);
  });

  it("getLangPathByPath: get path string as param, should return path properly", () => {
    const testRoute = routesList.find((el) => el.name === "home");
    expect(
      getLangPathByPath({
        path: testRoute.path,
        base: "/",
        lang: "de",
        routes: routesList,
      })
    ).toBe(testRoute?.path?.de);
  });

  it("getLangPathByPath: get path object as param, should return path properly", () => {
    const testRoute = routesList.find((el) => el.name === "home");
    const path = testRoute?.path;
    expect(
      getLangPathByPath({
        path: path,
        base: "/",
        lang: "de",
        routes: routesList,
      })
    ).toBe(path?.de);
  });
});
