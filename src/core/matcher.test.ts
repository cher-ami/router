import { TRoute } from "../components/Router";
import { formatRoutes, preventSlashes } from "./helpers";
import { getNotFoundRoute, getRouteFromUrl } from "./matcher";

const routesList: TRoute[] = [
  {
    path: "/",
    name: "HomePage",
    children: [
      {
        path: "/hello",
        name: "HelloPage",
      },
      {
        path: "/hello-2",
        name: "Hello2Page",
        getStaticProps: async (props) => {
          const res = await fetch("https://worldtimeapi.org/api/ip");
          const time = await res.json();
          return { time };
        },
      },
    ],
  },
  {
    path: "/bar/:id",
    name: "BarPage",
    props: {
      color: "blue",
    },
  },
  {
    path: "/about",
    children: [
      {
        path: "/route2",
        name: "Route2Page",
        children: [
          {
            path: "/:testParam?",
            children: [
              {
                path: "/foo4",
                props: { color: "red" },
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "/end", name: "EndPage" },
  { path: "/:rest", name: "NotFoundPage" },
];
const base = "/custom/base";

describe("matcher", () => {
  it("should get right route from URL", () => {
    // exemple 1
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

    // example-client 2
    // prettier-ignore
    const getRoute3 = getRouteFromUrl({ pUrl: "/hello-2", pRoutes: routesList, pBase: "/" });
    expect(getRoute3.fullPath).toBe(`/hello-2`);

    // example-client 3
    const getRoute2 = getRouteFromUrl({ pUrl: "/end", pRoutes: routesList, pBase: "/" });
    expect(getRoute2.name).toBe(`EndPage`);
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
