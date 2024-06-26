import React from "react";
import { Router, TRoute } from "../src";
import { render } from "@testing-library/react";
import { createBrowserHistory } from "history";

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
    const history = createBrowserHistory();

    const { container } = render(
      <Router routes={routesList} base={"/"} history={history}>
        <div id={"app"}>app</div>
      </Router>
    );
    const router = container.firstChild;
    expect(router.textContent).toBe("app");
  });
});
