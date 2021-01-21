import React from "React";
import { Router, TRoute } from "../src";
import { render } from "@testing-library/react";

describe("Router", () => {
  const routesList: TRoute[] = [
    {
      path: "/",
      component: null,
    },
  ];

  it("should be defined", () => {
    expect(Router).toBeDefined();
  });

  it("should return a children", () => {
    const { container } = render(
      <Router routes={routesList} base={"/"}>
        <div id={"app"}>app</div>
      </Router>
    );
    const router = container.firstChild;
    expect(router.textContent).toBe("app");
  });
});
