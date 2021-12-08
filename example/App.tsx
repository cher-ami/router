import React from "react";
import { Link, Routers, Stack } from "../src";

const componentName = "App";

/**
 * @name App
 */
export default function App() {
  return (
    <div className={componentName}>
      {["en", "fr", "de", "nl"].map((el, i) => (
        <button
          key={i}
          children={el}
          onClick={() => {
            Routers.langService?.setLang({ key: el });
          }}
        />
      ))}

      <nav>
        <ul>
          <li>
            <Link to={{ name: "HomePage" }}>Home</Link>
          </li>
          <li>
            <Link to={{ name: "ArticlePage", params: { id: "article-1" } }}>
              Blog id:article-1
            </Link>
          </li>
          <li>
            <Link to={{ name: "AboutPage" }}>About (has sub router)</Link>
          </li>
        </ul>
      </nav>
      <Stack className={"App_stack"} />
    </div>
  );
}
