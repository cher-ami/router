import { TRoute } from "../components/Router";
import { preventSlashes } from "./helpers";
import { getRouteFromUrl } from "./matcher";

const routesList: TRoute[] = [
  { path: "/", component: null, name: "HomePage" },
  { path: "/foo", component: null, name: "FooPage" },
  { path: "/bar/:id", component: null, name: "BarPage", props: { color: "blue" } },
  { path: "/:rest", component: null, name: "NotFoundPage" },
];
const base = "/custom/base";

describe("getRouteFromUrl", () => {
  it("should get right route from URL", () => {
    const getRoute = getRouteFromUrl({
      pUrl: preventSlashes(`${base}/bar/foo`),
      pRoutes: routesList,
      pBase: base,
    });

    expect(getRoute.fullUrl).toBe(`${base}/bar/foo`);
    expect(getRoute.fullPath).toBe(`${base}/bar/:id`);
    expect(getRoute.path).toBe("/bar/:id");
    expect(getRoute.url).toBe("/bar/foo");
    expect(getRoute.name).toBe(`BarPage`);
    expect(getRoute.props).toEqual({ params: { id: "foo" }, color: "blue" });
  });

  it("should not get route from bad URL and return undefined", () => {
    const getRoute = getRouteFromUrl({
      pUrl: preventSlashes(`${base}/bar/foo/bar/`),
      pRoutes: routesList,
      pBase: base,
    });
    expect(getRoute).toBeUndefined();
  });
});
