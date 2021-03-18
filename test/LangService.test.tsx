import LangService, { Link, Router, TRoute } from "../src";
import { act, render } from "@testing-library/react";
import React from "react";

const locales = [{ key: "en" }, { key: "fr" }, { key: "de" }];
const routesList: TRoute[] = [
  { path: "/", component: null },
  { path: "/foo", component: null },
];

describe("LangService", () => {
  it("should turn init to true after init", () => {
    LangService.init(locales);
    expect(LangService.isInit).toBe(true);
  });

  // it("should show default lang in URL", async () => {
  //   LangService.init(locales, true);
  //   const App = () => {
  //     return (
  //       <Router base={"/"} routes={routesList}>
  //         <Link to={"/foo"} className={"containerLink"}>
  //           Foo
  //         </Link>
  //       </Router>
  //     );
  //   };
  //   const { container } = await render(<App />);
  //   const link: any = container.firstChild;
  //   expect(link.getAttribute("href")).toBe("/en/foo");
  // });

  // it("should hide default lang in URL", () => {
  //   LangService.init(locales, false);
  // });

  //it("setLang should process window.open", () => {
  //   LangService.init([{ key: "en" }], true);
  //   expect(LangService.isInit).toBe(true);
  //});
});
