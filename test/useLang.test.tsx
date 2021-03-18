import { Router, TRoute, useLang } from "../src";
import React from "react";
import LangService from "../src";
import { render } from "@testing-library/react";

const locales = [{ key: "en" }, { key: "fr" }, { key: "de" }];
const routesList: TRoute[] = [
  { path: "/", component: null },
  { path: "/foo", component: null },
];

const App = ({ base = "/" }) => (
  <Router base={base} routes={routesList}>
    <div>Foo</div>
  </Router>
);

describe("useLang", () => {
  it("should return current lang", () => {
    LangService.init(locales, true);
    render(<App />);
    const [lang, setLang] = useLang();
    expect(lang).toEqual(locales[0]);
  });
});
