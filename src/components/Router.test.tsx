import React from "react";
import { Router } from "./Router";
import { render } from "@testing-library/react";
import { TRoute } from "./Router";
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
    const { container } = render(
      <Router routes={routesList} history={createBrowserHistory()}>
        <div id={"app"}>app</div>
      </Router>
    );
    const router = container.firstChild;
    expect(router.textContent).toBe("app");
  });
});
