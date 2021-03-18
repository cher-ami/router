import React from "react";
import { Link, Router, TRoute } from "../src";
import { render, fireEvent } from "@testing-library/react";
import { ROUTERS } from "../src/api/routers";
import LangService from "../src";

const locales = [{ key: "en" }, { key: "fr" }, { key: "de" }];
const routesList: TRoute[] = [
  { path: "/", component: null },
  { path: "/foo", component: null },
];

afterEach(() => {
  LangService.isInit = false;
});

const mockClickHandler = jest.fn();
const App = ({ base = "/", to = "/foo" }) => {
  return (
    <Router base={base} routes={routesList}>
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

  it("sould add formatted URL to href attr if custom base is set", () => {
    const { container } = render(<App base={"/master"} to={"/foo"} />);
    const link: any = container.firstChild;
    expect(link.getAttribute("href")).toBe("/master/foo");
  });

  it("should show default lang in href link", async () => {
    LangService.init(locales, true);
    const { container } = await render(<App base={"/"} to={"/foo"} />);
    const href = (container.firstChild as HTMLLinkElement).getAttribute("href");
    expect(href).toBe("/en/foo");
  });

  it("shouldn't show default lang in href link", async () => {
    LangService.init(locales, false);
    const { container } = await render(<App base={"/"} to={"/foo"} />);
    const href = (container.firstChild as HTMLLinkElement).getAttribute("href");
    expect(href).toBe("/foo");
  });

  it("should execute callback on click", () => {
    const { container } = render(<App base={"/"} to={"/foo"} />);
    fireEvent.click(container.firstChild);
    expect(mockClickHandler.mock.calls.length).toBe(1);
    fireEvent.click(container.firstChild);
    fireEvent.click(container.firstChild);
    expect(mockClickHandler.mock.calls.length).toBe(3);
  });

  it("should push in history on click", () => {
    const { container } = render(<App to={"/bar"} />);
    fireEvent.click(container.firstChild);
    expect(ROUTERS.history.location.pathname).toBe("/bar");
    expect(ROUTERS.history.action).toBe("PUSH");
  });
});
