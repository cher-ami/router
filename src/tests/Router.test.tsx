/**
 * @vitest-environment jsdom
 */

import { it, expect, describe } from "vitest";
import React from "react";
import { TRoute, Router } from "..";
import { render } from "@testing-library/react";
import { createBrowserHistory } from "history";

describe("Router", () => {
  const routesList: TRoute[] = [
    {
      path: "/",
      component: null,
      name: "Home",
    },
  ];

  it("should be defined", () => {
    expect(Router).toBeDefined();
  });

  it("should return a children", () => {
    const { container } = render(
      <Router routes={routesList} history={createBrowserHistory()}>
        <div id={"app"}>app</div>
      </Router>,
    );
    const router = container.firstChild;
    expect(router.textContent).toBe("app");
  });
});
