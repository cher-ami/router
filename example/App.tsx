import React, { useEffect } from "react";
import { Link, Stack } from "../src";
import { LangService } from "../src";

const componentName = "App";
const debug = require("debug")(`router:${componentName}`);

/**
 * @name App
 */
export default function App() {
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
            <Link to={{ name: "HomePage" }}>Home</Link>
          </li>
          <li>
            <Link to={{ name: "AboutPage" }}>About</Link>
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
