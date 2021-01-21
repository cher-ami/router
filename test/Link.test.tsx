import React from "react";
import { Link } from "../src";
import { render, fireEvent } from "@testing-library/react";
import { ROUTERS } from "../src/api/routers";

describe("Link", () => {

  it("should be defined", () => {
    expect(Link).toBeDefined();
  });

  it("should renders proper attributes", () => {
    const { container } = render(
      <Link to={"/foo"} className={"containerLink"}>
        Foo
      </Link>
    );
    const link: any = container.firstChild;
    expect(link.tagName).toBe("A");
    expect(link.className).toBe("Link containerLink");
    expect(link.getAttribute("href")).toBe("/foo");
    expect(link.textContent).toBe("Foo");
  });

  it("should execute callback on click", () => {
    const mock = jest.fn();
    const { container } = render(
      <Link to={"/foo"} onClick={mock}>
        Foo
      </Link>
    );
    fireEvent.click(container.firstChild);
    expect(mock.mock.calls.length).toBe(1);
    fireEvent.click(container.firstChild);
    fireEvent.click(container.firstChild);
    expect(mock.mock.calls.length).toBe(3);
  });

  it("should push in history on click", () => {
    const { container } = render(<Link to={"/bar"}>Foo</Link>);
    fireEvent.click(container.firstChild);
    expect(ROUTERS.history.location.pathname).toBe("/bar");
    expect(ROUTERS.history.action).toBe("PUSH");
  });

});
