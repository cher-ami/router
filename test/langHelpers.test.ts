import { TRoute } from "../src";
import { selectLangAlternatePathByPath } from "../src/lang/langHelpers";

export const routesList: TRoute[] = [
  { path: { en: "/home", fr: "/accueil" }, component: null },
  { path: "/news", component: null },
  {
    path: { en: "/about", fr: "/a-propos" },
    component: null,
    children: [
      { path: "/foo", component: null },
      { path: "/bar", component: null },
    ],
  },
];

describe("langHelpers", () => {
  it("selectLangPathByAlternatePath: sould return path if current path is string", () => {
    const alternatePath = selectLangAlternatePathByPath("/news", "en", routesList);
    const testRoute = routesList.find((el) => el.path === "/news");
    console.log("testRoute", testRoute);
    expect(alternatePath).toBe(testRoute.path);
  });

  it("selectLangPathByAlternatePath: sould return path if current path is object", () => {
    const alternatePath = selectLangAlternatePathByPath("/a-propos", "en", routesList);
    const testRoute = routesList.find((el) => el.path?.fr === "/a-propos");
    expect(alternatePath).toBe(testRoute.path?.en);
  });
});
