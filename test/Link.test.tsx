import React from "react";
import { Link, Router, TRoute } from "../src";
import { render, fireEvent } from "@testing-library/react";

const routesList: TRoute[] = [
  { path: "/", name: "HomePage" },
  { path: "/foo", name: "FooPage" },
  { path: "/bar/:id", name: "BarPage" },
];

const mockClickHandler = jest.fn();
const App = ({ base = "/", to }: { base: string; to: string }) => {
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

  it("should execute callback on click", () => {
    const { container } = render(<App base={"/"} to={"/foo"} />);
    fireEvent.click(container.firstChild);
    expect(mockClickHandler.mock.calls.length).toBe(1);
    fireEvent.click(container.firstChild);
    fireEvent.click(container.firstChild);
    expect(mockClickHandler.mock.calls.length).toBe(3);
  });
});
