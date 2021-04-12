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
    path: { en: "/about", fr: "/a-propos", de: "uber", name: "about" },
    component: null,
    children: [
      { path: "/foo", component: null, name: "foo" },
      { path: "/bar", component: null, name: "bar" },
    ],
  },
];

describe("langHelpers", () => {
  it("getLangPathByPath: should return path if current path is string", () => {
    const testRoute = routesList.find((el) => el.name === "news");
    const path = testRoute.path;
    const alternatePath = getLangPathByPath(path, "de", routesList);
    expect(alternatePath).toBe(testRoute.path);
  });

  it("getLangPathByPath: get path string as param, should return path properly", () => {
    const testRoute = routesList.find((el) => el.name === "home");
    const path: string = testRoute.path;
    const alternatePath = getLangPathByPath(path, "de", routesList);
    expect(alternatePath).toBe(testRoute?.path?.de);
  });

  it("getLangPathByPath: get path object as param, should return path properly", () => {
    const testRoute = routesList.find((el) => el.name === "home");
    const path: { [x: string]: string } = testRoute.path;
    const alternatePath = getLangPathByPath(path, "de", routesList);
    expect(alternatePath).toBe(testRoute?.path?.de);
  });
});
