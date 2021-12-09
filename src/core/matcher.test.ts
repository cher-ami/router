import { TRoute } from "../components/Router";
import { preventSlashes } from "./helpers";
import { getRouteFromUrl } from "./matcher";

// prettier-ignore
const routesList: TRoute[] = [
  { path: "/", name: "HomePage" },
  { path: "/bar/:id", name: "BarPage", props: { color: "blue" } },
  {
    path: "/about",
    children: [
      {
        path: "/route2",
        children: [
          {
            path: "/:testParam?",
            children: [
              {
                 path: "/foo4" ,
                 props: { color: "red" },

              }
            ],
          },
        ],
      },
    ],
  },
];
const base = "/custom/base";

describe("getRouteFromUrl", () => {
  it("should get right route from URL", () => {
    const getRoute = getRouteFromUrl({
      pUrl: preventSlashes(`${base}/bar/my-id`),
      pRoutes: routesList,
      pBase: base,
    });

    expect(getRoute.fullUrl).toBe(`${base}/bar/my-id`);
    expect(getRoute.fullPath).toBe(`${base}/bar/:id`);
    expect(getRoute.path).toBe("/bar/:id");
    expect(getRoute.url).toBe("/bar/my-id");
    expect(getRoute.name).toBe(`BarPage`);
    expect(getRoute.props).toEqual({ params: { id: "my-id" }, color: "blue" });
  });

  it("should get right route from URL with subRoute", () => {
    const getRoute = getRouteFromUrl({
      pUrl: "/about/route2/super/foo4",
      pRoutes: routesList,
      pBase: "/",
    });

    expect(getRoute.fullUrl).toBe(`/about/route2/super/foo4`);
    expect(getRoute.fullPath).toBe(`/about/route2/:testParam?/foo4`);

    // this is the component we need to render at this level
    expect(getRoute.path).toBe("/about");
    expect(getRoute.url).toBe("/about");
    // not return props {color: red }, this is the appropriate router who takes this child route
    // witch will return it
    expect(getRoute.props).toEqual({ params: { testParam: "super" } });
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
