import { langMiddleware, TRoute } from "../src";

const routesList: TRoute[] = [
  {
    path: "/",
    component: null,
  },
  {
    path: "/hello",
    component: null,
    children: [
      { path: "/zoo", component: null },
      { path: "/:id", component: null },
    ],
  },
];

const patchRoutesList: TRoute[] = [
  {
    path: "/:lang",
    component: null,
  },
  {
    path: "/:lang/hello",
    component: null,
    children: [
      { path: "/zoo", component: null },
      { path: "/:id", component: null },
    ],
  },
];

describe("LangMiddleware", () => {
  it("should patch all first level routes if LangService is init", () => {
    expect(langMiddleware(routesList, true)).toEqual(patchRoutesList);
  });
  it("should not patch routes if LangService is not init", () => {
    expect(langMiddleware(routesList, false)).toEqual(routesList);
  });
});
