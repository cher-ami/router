import React from "react";
import { CreateRouter, ERouterEvent, TRoute } from "../src";
import { ROUTERS } from "../src/api/routers";
import { preventSlashes } from "../src/api/helpers";

/**
 * Create Router Test
 * Allow to access protected methods of CreateRouter class
 */
export class CreateRouterTest extends CreateRouter {
  public updateRoute(
    url: string = ROUTERS.history.location.pathname
  ): { currentRoute: TRoute; previousRoute: TRoute } {
    return super.updateRoute(url);
  }

  public getRouteFromUrl({ pUrl }): TRoute {
    return super.getRouteFromUrl({ pUrl });
  }
}

/**
 * Prepare & Create instance
 */
const routesList: TRoute[] = [
  { path: "/", component: null, name: "HomePage" },
  { path: "/foo", component: null, name: "FooPage" },
  { path: "/bar/:id", component: null, name: "BarPage", props: { color: "blue" } },
  { path: "/:rest", component: null, name: "NotFoundPage" },
];
const base = "/custom/base";
const router = new CreateRouterTest({
  base: base,
  routes: routesList,
});

/**
 * Tests
 */
describe("CreateRouter", () => {
  it("should get right route from URL", () => {
    const getRoute = router.getRouteFromUrl({ pUrl: preventSlashes(`${base}/bar/foo`) });
    expect(getRoute.fullUrl).toBe(`${base}/bar/foo`);
    expect(getRoute.fullPath).toBe(`${base}/bar/:id`);
    expect(getRoute.path).toBe("/bar/:id");
    expect(getRoute.url).toBe("/bar/foo");
    expect(getRoute.name).toBe(`BarPage`);
    expect(getRoute.props).toEqual({ params: { id: "foo" }, color: "blue" });
  });

  it("should not get route from bad URL and return undefined", () => {
    const getRoute = router.getRouteFromUrl({
      pUrl: preventSlashes(`${base}/bar/foo/bar/`),
    });
    expect(getRoute).toBeUndefined();
  });

  it("updateRoute method should return prev & current routes objects", () => {
    // to bar page
    const updateRoute = router.updateRoute(preventSlashes(`${base}/bar/foo`));
    expect(updateRoute.currentRoute.name).toBe("BarPage");

    // to not found
    const updateRouteToNotFound = router.updateRoute(
      preventSlashes(`${base}/bar/foo/dlksd`)
    );
    expect(updateRouteToNotFound.currentRoute.path).toBe("/:rest");
    expect(updateRouteToNotFound.previousRoute.path).toBe("/bar/:id");

    // to home page
    const updateRouteToHome = router.updateRoute(preventSlashes(`${base}/`));
    expect(updateRouteToHome.currentRoute.name).toBe("HomePage");
    expect(updateRouteToHome.previousRoute.name).toBe("NotFoundPage");

    // same URL
    const updateRouteToHomeAgain = router.updateRoute(preventSlashes(`${base}/`));
    expect(updateRouteToHomeAgain).toBeUndefined();
  });
});
