import React, { useEffect } from "react";
import { Link, useRouteCounter, Stack, useHistory } from "../src";
import { LangService } from "../src";
import { getLangPathByPath } from "../src/lang/langHelpers";

const componentName = "App";
const debug = require("debug")(`router:${componentName}`);

/**
 * @name App
 */
export default function App() {
  const history = useHistory();
  useEffect(() => {
    debug("history", history);
  }, [history]);

  const count = useRouteCounter();
  useEffect(() => {
    debug("count", count);
  }, [count]);

  useEffect(() => {
    LangService.redirect();
  }, []);

  return (
    <div className={componentName}>
      <button
        onClick={() => {
          LangService.setLang({ key: "en" });
        }}
      >
        CHANGE LANGUAGE TO EN
      </button>
      <button
        onClick={() => {
          LangService.setLang({ key: "fr" });
        }}
      >
        CHANGE LANGUAGE TO FR
      </button>
      <button
        onClick={() => {
          LangService.setLang({ key: "de" });
        }}
      >
        CHANGE LANGUAGE TO DE
      </button>
      <button
        onClick={() => {
          LangService.setLang({ key: "nl" });
        }}
      >
        CHANGE LANGUAGE TO NL
      </button>
      <nav>
        <ul>
          <li>
            <Link to={"/"}>Home</Link>
          </li>
          <li>
            <Link to={getLangPathByPath({ path: "/about" })}>About</Link>
          </li>
          <li>
            <Link to={{ name: "ArticlePage", params: { id: "article-1" } }}>
              Blog id:article-1
            </Link>
          </li>
          <li>
            <Link to={"/not/found/"}>Not found route</Link>
          </li>
        </ul>
      </nav>
      <Stack className={"App_stack"} />
    </div>
  );
}
