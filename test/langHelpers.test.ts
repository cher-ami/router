import { TRoute } from "../src";
import { selectLangPathByPath } from "../src/lang/langHelpers";

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
  it("selectAlternateLangPathByPath: sould return path if current path is string", () => {
    const testRoute = routesList.find((el) => el.name === "news");
    const alternatePath = selectLangPathByPath(testRoute.path, "de", routesList);
    expect(alternatePath).toBe(testRoute.path);
  });

  it("selectAlternateLangPathByPath: sould return path if current path is object", () => {
    const testRoute = routesList.find((el) => el.name === "home");
    const alternatePath = selectLangPathByPath(
      testRoute.path.fr,
      "de",
      routesList
    );
    expect(alternatePath).toBe(testRoute?.path?.de);
  });
});
