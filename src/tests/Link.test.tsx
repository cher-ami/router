/**
 * @vitest-environment jsdom
 */

import { vi, it, expect, describe } from "vitest";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Routers } from "../core/Routers";
import LangService from "../core/LangService";
import { TOpenRouteParams } from "../core/core";
import { Link } from "..";
import { Router } from "..";
import { TRoute } from "..";
import { createBrowserHistory } from "history";

const locales = [{ key: "en" }, { key: "fr" }, { key: "de" }];
const routesList: TRoute[] = [
  { path: "/", component: null, name: "HomePage" },
  { path: "/foo", component: null, name: "FooPage" },
  { path: "/bar/:id", component: null, name: "BarPage" },
];

const mockClickHandler = vi.fn();
const App = ({ base = "/", to }: { base: string; to: string | TOpenRouteParams }) => {
  const langService = new LangService({
    languages: locales,
    base,
    showDefaultLangInUrl: false,
  });

  return (
    <Router
      langService={langService}
      base={base}
      routes={routesList}
      history={createBrowserHistory()}
    >
      <Link to={to} className={"containerLink"} onClick={mockClickHandler}>
        Foo
      </Link>
    </Router>
  );
};

describe("Link", () => {
  it("should renders proper attributes", () => {
    const { container } = render(<App base={"/"} to={"/foo"} />);
    const link: any = container.firstChild;
    expect(link.tagName).toBe("A");
    expect(link.className).toBe("Link containerLink");
    expect(link.getAttribute("href")).toBe("/foo");
    expect(link.textContent).toBe("Foo");
  });

  // Can't test base URL added on link because the base /master is store in "Routers" object
  // and this one is used by Link > createUrl()
  it("sould add formatted URL to href attr if custom base is set", () => {
    // const { container } = render(<App base={"/master"} to={"/foo"} />);
    // const link: any = container.firstChild;
    // expect(link.getAttribute("href")).toBe("/master/foo");
  });

  // FIXME now we need to create LangService instance
  it("should show default lang in href link", async () => {
    //LangService.init(locales, true);
    // const { container } = await render(<App base={"/"} to={"/foo"} />);
    // const href = (container.firstChild as HTMLLinkElement).getAttribute("href");
    // expect(href).toBe("/foo");
  });

  // FIXME now we need to create LangService instance
  it("shouldn't show default lang in href link", async () => {});

  it("should execute callback on click", () => {
    const { container } = render(<App base={"/"} to={"/foo"} />);
    fireEvent.click(container.firstChild);
    expect(mockClickHandler.mock.calls.length).toBe(1);
    fireEvent.click(container.firstChild);
    fireEvent.click(container.firstChild);
    expect(mockClickHandler.mock.calls.length).toBe(3);
  });

  it("should return the right href URL", () => {
    const { container } = render(<App base={"/"} to={{ name: "FooPage" }} />);
    fireEvent.click(container.firstChild);
    expect(Routers.history.location.pathname).toBe("/foo");
  });

  it("should return the right href URL with param", () => {
    const { container } = render(
      <App base={"/"} to={{ name: "BarPage", params: { id: "test" } }} />,
    );
    fireEvent.click(container.firstChild);
    expect(Routers.history.location.pathname).toBe("/bar/test");
  });

  it("should push in history on click", () => {
    const { container } = render(<App base={"/"} to={"/bar"} />);
    fireEvent.click(container.firstChild);
    expect(Routers.history.location.pathname).toBe("/bar");
    expect(Routers.history.action).toBe("PUSH");
  });
});
