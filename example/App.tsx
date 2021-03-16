import React, { useEffect } from "react";
import { Link, useRouteCounter, Stack, useHistory } from "../src";
import LanguagesService from "../src/languages/LanguagesService";

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

  return (
    <div className={componentName}>
      <button
        onClick={() => {
          LanguagesService.setLanguage({ key: "en" });
        }}
      >
        CHANGE LANGUAGE TO EN
      </button>
      <button
        onClick={() => {
          LanguagesService.setLanguage({ key: "fr" });
        }}
      >
        CHANGE LANGUAGE TO FR
      </button>
      <button
        onClick={() => {
          LanguagesService.setLanguage({ key: "de" });
        }}
      >
        CHANGE LANGUAGE TO DE
      </button>
      <button
        onClick={() => {
          LanguagesService.setLanguage({ key: "nl" });
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
            <Link to={"/about"}>About</Link>
          </li>
          <li>
            <Link to={"/blog/article-1"}>Blog id:article-1</Link>
          </li>
        </ul>
      </nav>
      <Stack className={"App_stack"} />
    </div>
  );
}
