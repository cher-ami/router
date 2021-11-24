import React, { useEffect } from "react";
import { Link, Stack, useRouter } from "../src";
import { LangService } from "../src";

const componentName = "App";

/**
 * @name App
 */
export default function App() {
  const { currentRoute } = useRouter();

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
        EN
      </button>
      <button
        onClick={() => {
          LangService.setLang({ key: "fr" });
        }}
      >
        FR
      </button>
      <button
        onClick={() => {
          LangService.setLang({ key: "de" });
        }}
      >
        DE
      </button>
      <button
        onClick={() => {
          LangService.setLang({ key: "nl" });
        }}
      >
        NL
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
